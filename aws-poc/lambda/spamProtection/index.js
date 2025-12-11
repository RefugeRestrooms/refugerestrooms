const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const RATE_LIMIT_TABLE = process.env.RATE_LIMIT_TABLE;
const SPAM_KEYWORDS = [
  'viagra', 'casino', 'lottery', 'bitcoin', 'crypto', 'investment',
  'make money', 'work from home', 'click here', 'free money'
];

/**
 * Check if content contains spam indicators
 */
function containsSpamKeywords(text) {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  return SPAM_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Check for suspicious patterns in restroom data
 */
function detectSuspiciousPatterns(restroom) {
  const suspiciousIndicators = [];
  
  // Check for spam keywords in text fields
  const textFields = ['name', 'street', 'city', 'comment', 'directions'];
  for (const field of textFields) {
    if (containsSpamKeywords(restroom[field])) {
      suspiciousIndicators.push(`spam_keywords_in_${field}`);
    }
  }
  
  // Check for excessive length (potential spam)
  if (restroom.comment && restroom.comment.length > 500) {
    suspiciousIndicators.push('excessive_comment_length');
  }
  
  // Check for URLs in inappropriate fields
  const urlPattern = /https?:\/\/[^\s]+/gi;
  if (restroom.name && urlPattern.test(restroom.name)) {
    suspiciousIndicators.push('url_in_name');
  }
  
  // Check for repeated characters (common spam pattern)
  const repeatedPattern = /(.)\1{4,}/;
  if (restroom.name && repeatedPattern.test(restroom.name)) {
    suspiciousIndicators.push('repeated_characters');
  }
  
  return suspiciousIndicators;
}

/**
 * Check rate limiting based on IP address
 */
async function checkRateLimit(ipAddress) {
  const now = Date.now();
  const windowStart = now - (60 * 60 * 1000); // 1 hour window
  
  try {
    const result = await docClient.send(new GetCommand({
      TableName: RATE_LIMIT_TABLE,
      Key: { ipAddress }
    }));
    
    const record = result.Item;
    if (!record) {
      // First submission from this IP
      await docClient.send(new PutCommand({
        TableName: RATE_LIMIT_TABLE,
        Item: {
          ipAddress,
          submissions: 1,
          firstSubmission: now,
          lastSubmission: now,
          ttl: Math.floor((now + 24 * 60 * 60 * 1000) / 1000) // 24 hour TTL
        }
      }));
      return { allowed: true, remaining: 4 };
    }
    
    // Check if within rate limit (5 submissions per hour)
    if (record.firstSubmission < windowStart) {
      // Reset window
      await docClient.send(new PutCommand({
        TableName: RATE_LIMIT_TABLE,
        Item: {
          ipAddress,
          submissions: 1,
          firstSubmission: now,
          lastSubmission: now,
          ttl: Math.floor((now + 24 * 60 * 60 * 1000) / 1000)
        }
      }));
      return { allowed: true, remaining: 4 };
    }
    
    if (record.submissions >= 5) {
      return { 
        allowed: false, 
        remaining: 0,
        resetTime: record.firstSubmission + (60 * 60 * 1000)
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
      remaining: 5 - record.submissions - 1 
    };
    
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Allow on error to avoid blocking legitimate users
    return { allowed: true, remaining: 5 };
  }
}

/**
 * Main spam protection function
 */
async function checkSpam(restroom, context) {
  const results = {
    isSpam: false,
    confidence: 0,
    reasons: [],
    rateLimit: null
  };
  
  // Extract IP from request context
  const ipAddress = context?.identity?.sourceIp || 'unknown';
  
  // Check rate limiting
  const rateLimitResult = await checkRateLimit(ipAddress);
  results.rateLimit = rateLimitResult;
  
  if (!rateLimitResult.allowed) {
    results.isSpam = true;
    results.confidence = 1.0;
    results.reasons.push('rate_limit_exceeded');
    return results;
  }
  
  // Check for suspicious patterns
  const suspiciousIndicators = detectSuspiciousPatterns(restroom);
  
  if (suspiciousIndicators.length > 0) {
    results.reasons = suspiciousIndicators;
    results.confidence = Math.min(suspiciousIndicators.length * 0.3, 1.0);
    
    // Mark as spam if confidence is high
    if (results.confidence >= 0.7) {
      results.isSpam = true;
    }
  }
  
  return results;
}

module.exports = {
  checkSpam,
  detectSuspiciousPatterns,
  checkRateLimit
};