const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { LocationClient, SearchPlaceIndexForTextCommand } = require('@aws-sdk/client-location');
const { checkSpam } = require('../spamProtection');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const locationClient = new LocationClient({});

const TABLE_NAME = process.env.TABLE_NAME;
const PLACE_INDEX_NAME = process.env.PLACE_INDEX_NAME || null;

/**
 * Geocode an address using AWS Location Service
 * Falls back to null coordinates if geocoding fails
 */
async function geocodeAddress(street, city, state, country) {
  if (!PLACE_INDEX_NAME) {
    console.log('No place index configured, skipping geocoding');
    return { latitude: null, longitude: null };
  }

  try {
    const address = `${street}, ${city}, ${state}, ${country}`;
    const command = new SearchPlaceIndexForTextCommand({
      IndexName: PLACE_INDEX_NAME,
      Text: address,
      MaxResults: 1
    });

    const response = await locationClient.send(command);
    
    if (response.Results && response.Results.length > 0) {
      const [longitude, latitude] = response.Results[0].Place.Geometry.Point;
      return { latitude, longitude };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }

  return { latitude: null, longitude: null };
}

/**
 * Validate restroom input
 */
function validateInput(input) {
  const errors = [];

  if (!input.name || input.name.trim().length === 0) {
    errors.push('Name is required');
  }
  if (!input.street || input.street.trim().length === 0) {
    errors.push('Street is required');
  }
  if (!input.city || input.city.trim().length === 0) {
    errors.push('City is required');
  }
  if (!input.state || input.state.trim().length === 0) {
    errors.push('State is required');
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
}

/**
 * Lambda handler for creating a restroom
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const input = event.arguments.input;
    
    // Validate input
    validateInput(input);

    // Create temporary restroom object for spam checking
    const tempRestroom = {
      name: input.name?.trim(),
      street: input.street?.trim(),
      city: input.city?.trim(),
      state: input.state?.trim(),
      country: input.country || 'US',
      comment: input.comment || '',
      directions: input.directions || ''
    };

    // Check for spam
    const spamCheck = await checkSpam(tempRestroom, event.requestContext);
    
    if (spamCheck.isSpam) {
      console.log('Spam detected:', {
        reasons: spamCheck.reasons,
        confidence: spamCheck.confidence
      });
      
      throw new Error(`Submission rejected: ${spamCheck.reasons.includes('rate_limit_exceeded') 
        ? 'Too many submissions. Please try again later.' 
        : 'Content appears to be spam.'}`);
    }

    // Log spam check results for monitoring
    if (spamCheck.confidence > 0) {
      console.log('Suspicious content detected but allowed:', {
        reasons: spamCheck.reasons,
        confidence: spamCheck.confidence
      });
    }

    // Geocode the address
    const { latitude, longitude } = await geocodeAddress(
      input.street,
      input.city,
      input.state,
      input.country
    );

    // Create restroom object
    const now = new Date().toISOString();
    const restroom = {
      id: `restroom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: input.name.trim(),
      street: input.street.trim(),
      city: input.city.trim(),
      state: input.state.trim(),
      country: input.country || 'US',
      latitude,
      longitude,
      accessible: input.accessible || false,
      unisex: input.unisex || false,
      changingTable: input.changingTable || false,
      comment: input.comment || '',
      directions: input.directions || '',
      upvote: 0,
      downvote: 0,
      approved: spamCheck.confidence === 0, // Auto-approve only if no suspicious indicators
      spamScore: spamCheck.confidence, // Store for admin review
      createdAt: now,
      updatedAt: now
    };

    // Save to DynamoDB
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: restroom,
      ConditionExpression: 'attribute_not_exists(id)'
    });

    await docClient.send(command);

    console.log('Restroom created:', {
      id: restroom.id,
      approved: restroom.approved,
      spamScore: restroom.spamScore
    });
    
    return restroom;

  } catch (error) {
    console.error('Error creating restroom:', error);
    throw new Error(`Failed to create restroom: ${error.message}`);
  }
};
