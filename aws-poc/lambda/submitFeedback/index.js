const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const FEEDBACK_TABLE = process.env.FEEDBACK_TABLE;
const RESTROOMS_TABLE = process.env.TABLE_NAME;
const RATE_LIMIT_TABLE = process.env.RATE_LIMIT_TABLE;

// Feedback reason categories
const POSITIVE_REASONS = ['SAFE', 'CLEAN', 'ACCESSIBLE', 'ACCURATE', 'PRIVATE'];
const NEGATIVE_REASONS = ['UNSAFE', 'DIRTY', 'INACCESSIBLE', 'OUTDATED', 'INAPPROPRIATE'];
const SAFETY_REASONS = ['SAFE', 'UNSAFE'];

/**
 * Check rate limiting for feedback submissions (prevent spam voting)
 */
async function checkFeedbackRateLimit(ipAddress, restroomId) {
  const now = Date.now();
  const windowStart = now - (24 * 60 * 60 * 1000); // 24 hour window
  const key = `${ipAddress}:${restroomId}`;
  
  try {
    const result = await docClient.send(new GetCommand({
      TableName: RATE_LIMIT_TABLE,
      Key: { ipAddress: key }
    }));
    
    const record = result.Item;
    if (!record) {
      // First feedback from this IP for this restroom
      await docClient.send(new PutCommand({
        TableName: RATE_LIMIT_TABLE,
        Item: {
          ipAddress: key,
          submissions: 1,
          firstSubmission: now,
          lastSubmission: now,
          ttl: Math.floor((now + 7 * 24 * 60 * 60 * 1000) / 1000) // 7 day TTL
        }
      }));
      return { allowed: true, remaining: 2 };
    }
    
    // Check if within rate limit (3 feedback submissions per restroom per day)
    if (record.firstSubmission < windowStart) {
      // Reset window
      await docClient.send(new PutCommand({
        TableName: RATE_LIMIT_TABLE,
        Item: {
          ipAddress: key,
          submissions: 1,
          firstSubmission: now,
          lastSubmission: now,
          ttl: Math.floor((now + 7 * 24 * 60 * 60 * 1000) / 1000)
        }
      }));
      return { allowed: true, remaining: 2 };
    }
    
    if (record.submissions >= 3) {
      return { 
        allowed: false, 
        remaining: 0,
        resetTime: record.firstSubmission + (24 * 60 * 60 * 1000)
      };
    }
    
    // Increment counter
    await docClient.send(new PutCommand({
      TableName: RATE_LIMIT_TABLE,
      Item: {
        ...record,
        submissions: record.submissions + 1,
        lastSubmission: now
      }
    }));
    
    return { 
      allowed: true, 
      remaining: 3 - record.submissions - 1 
    };
    
  } catch (error) {
    console.error('Feedback rate limit check failed:', error);
    return { allowed: true, remaining: 3 };
  }
}

/**
 * Validate feedback input
 */
function validateFeedback(input) {
  const errors = [];
  
  if (typeof input.positive !== 'boolean') {
    errors.push('Positive field must be true or false');
  }
  
  if (input.reasons && Array.isArray(input.reasons)) {
    const validReasons = [...POSITIVE_REASONS, ...NEGATIVE_REASONS];
    const invalidReasons = input.reasons.filter(reason => !validReasons.includes(reason));
    
    if (invalidReasons.length > 0) {
      errors.push(`Invalid reasons: ${invalidReasons.join(', ')}`);
    }
    
    // Check reason consistency
    const hasPositiveReasons = input.reasons.some(r => POSITIVE_REASONS.includes(r));
    const hasNegativeReasons = input.reasons.some(r => NEGATIVE_REASONS.includes(r));
    
    if (input.positive && hasNegativeReasons) {
      errors.push('Cannot use negative reasons with positive feedback');
    }
    
    if (!input.positive && hasPositiveReasons) {
      errors.push('Cannot use positive reasons with negative feedback');
    }
  }
  
  if (input.comment && input.comment.length > 500) {
    errors.push('Comment must be 500 characters or less');
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
}

/**
 * Calculate updated scores for a restroom
 */
async function calculateRestroomScores(restroomId) {
  // This would typically use a GSI to query all feedback for a restroom
  // For now, we'll implement a simple scan with filter (not optimal for production)
  
  try {
    const params = {
      TableName: FEEDBACK_TABLE,
      FilterExpression: 'restroomId = :restroomId',
      ExpressionAttributeValues: {
        ':restroomId': restroomId
      }
    };
    
    const result = await docClient.send(new ScanCommand(params));
    const feedbacks = result.Items || [];
    
    if (feedbacks.length === 0) {
      return {
        overallScore: 0,
        safetyScore: 0,
        totalFeedback: 0,
        positiveFeedback: 0,
        negativeFeedback: 0,
        confidence: 'LOW'
      };
    }
    
    // Apply time decay (recent feedback weighs more)
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    let totalWeight = 0;
    let positiveWeight = 0;
    let safetyWeight = 0;
    let safetySamples = 0;
    
    feedbacks.forEach(feedback => {
      const age = now - new Date(feedback.createdAt).getTime();
      let weight = 1.0;
      
      // Recent feedback gets bonus weight
      if (age < thirtyDaysAgo) {
        weight = 1.5;
      }
      
      // Safety-related feedback gets extra weight
      const hasSafetyReasons = feedback.reasons && 
        feedback.reasons.some(r => SAFETY_REASONS.includes(r));
      
      if (hasSafetyReasons) {
        weight *= 2.0;
        safetySamples++;
        if (feedback.positive) {
          safetyWeight += weight;
        }
      }
      
      totalWeight += weight;
      if (feedback.positive) {
        positiveWeight += weight;
      }
    });
    
    const overallScore = totalWeight > 0 ? (positiveWeight / totalWeight) * 100 : 0;
    const safetyScore = safetySamples > 0 ? (safetyWeight / (safetySamples * 2.0)) * 100 : null;
    
    // Confidence based on sample size
    let confidence = 'LOW';
    if (feedbacks.length >= 10) confidence = 'HIGH';
    else if (feedbacks.length >= 5) confidence = 'MEDIUM';
    
    return {
      overallScore: Math.round(overallScore * 10) / 10, // Round to 1 decimal
      safetyScore: safetyScore ? Math.round(safetyScore * 10) / 10 : null,
      totalFeedback: feedbacks.length,
      positiveFeedback: feedbacks.filter(f => f.positive).length,
      negativeFeedback: feedbacks.filter(f => !f.positive).length,
      confidence
    };
    
  } catch (error) {
    console.error('Error calculating scores:', error);
    return {
      overallScore: 0,
      safetyScore: 0,
      totalFeedback: 0,
      positiveFeedback: 0,
      negativeFeedback: 0,
      confidence: 'LOW'
    };
  }
}

/**
 * Lambda handler for submitting restroom feedback
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    const { restroomId, positive, reasons, comment } = event.arguments;
    
    // Validate input
    validateFeedback({ positive, reasons, comment });
    
    // Extract IP from request context for rate limiting
    const ipAddress = event.requestContext?.identity?.sourceIp || 'unknown';
    
    // Check rate limiting
    const rateLimitResult = await checkFeedbackRateLimit(ipAddress, restroomId);
    if (!rateLimitResult.allowed) {
      throw new Error('Too many feedback submissions for this restroom. Please try again tomorrow.');
    }
    
    // Verify restroom exists
    const restroomResult = await docClient.send(new GetCommand({
      TableName: RESTROOMS_TABLE,
      Key: { id: restroomId }
    }));
    
    if (!restroomResult.Item) {
      throw new Error('Restroom not found');
    }
    
    // Create feedback record
    const now = new Date().toISOString();
    const feedbackId = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const feedback = {
      id: feedbackId,
      restroomId,
      positive,
      reasons: reasons || [],
      comment: comment || '',
      ipHash: require('crypto').createHash('sha256').update(ipAddress).digest('hex').substring(0, 16),
      createdAt: now,
      updatedAt: now
    };
    
    // Add TTL for non-production environments (90 days)
    if (process.env.AWS_LAMBDA_FUNCTION_NAME && 
        !process.env.AWS_LAMBDA_FUNCTION_NAME.includes('prod')) {
      feedback.ttl = Math.floor((Date.now() + 90 * 24 * 60 * 60 * 1000) / 1000);
    }
    
    // Save feedback
    await docClient.send(new PutCommand({
      TableName: FEEDBACK_TABLE,
      Item: feedback,
      ConditionExpression: 'attribute_not_exists(id)'
    }));
    
    // Calculate updated scores
    const scores = await calculateRestroomScores(restroomId);
    
    // Update restroom with new scores (legacy upvote/downvote for compatibility)
    const updateExpression = `
      SET overallScore = :overallScore,
          safetyScore = :safetyScore,
          totalFeedback = :totalFeedback,
          confidence = :confidence,
          upvote = :upvote,
          downvote = :downvote,
          updatedAt = :updatedAt
    `;
    
    await docClient.send(new UpdateCommand({
      TableName: RESTROOMS_TABLE,
      Key: { id: restroomId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: {
        ':overallScore': scores.overallScore,
        ':safetyScore': scores.safetyScore,
        ':totalFeedback': scores.totalFeedback,
        ':confidence': scores.confidence,
        ':upvote': scores.positiveFeedback,
        ':downvote': scores.negativeFeedback,
        ':updatedAt': now
      }
    }));
    
    console.log('Feedback submitted:', {
      feedbackId,
      restroomId,
      positive,
      newScores: scores
    });
    
    // Return updated restroom data
    const updatedRestroom = await docClient.send(new GetCommand({
      TableName: RESTROOMS_TABLE,
      Key: { id: restroomId }
    }));
    
    return updatedRestroom.Item;
    
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw new Error(`Failed to submit feedback: ${error.message}`);
  }
};