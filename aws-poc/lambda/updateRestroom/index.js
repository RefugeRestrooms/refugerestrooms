const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { LocationClient, SearchPlaceIndexForTextCommand } = require('@aws-sdk/client-location');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const locationClient = new LocationClient({});

const TABLE_NAME = process.env.TABLE_NAME;
const PLACE_INDEX_NAME = process.env.PLACE_INDEX_NAME || null;

/**
 * Geocode an address using AWS Location Service
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
 * Lambda handler for updating a restroom
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const { id, input } = event.arguments;

    if (!id) {
      throw new Error('Restroom ID is required');
    }

    if (!input || Object.keys(input).length === 0) {
      throw new Error('Update input is required');
    }

    // First, check if the restroom exists
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    });

    const getResponse = await docClient.send(getCommand);

    if (!getResponse.Item) {
      throw new Error(`Restroom not found: ${id}`);
    }

    const existingRestroom = getResponse.Item;

    // Build update expression
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    let attributeCounter = 0;

    // Handle each field that can be updated
    const updatableFields = [
      'name', 'street', 'city', 'state', 'country',
      'accessible', 'unisex', 'changingTable', 'comment', 'directions'
    ];

    for (const field of updatableFields) {
      if (input[field] !== undefined && input[field] !== null) {
        const attrName = `#attr${attributeCounter}`;
        const attrValue = `:val${attributeCounter}`;
        
        expressionAttributeNames[attrName] = field;
        expressionAttributeValues[attrValue] = input[field];
        updateExpressions.push(`${attrName} = ${attrValue}`);
        
        attributeCounter++;
      }
    }

    // Check if address fields changed - if so, re-geocode
    const addressChanged = input.street || input.city || input.state || input.country;
    
    if (addressChanged) {
      const street = input.street || existingRestroom.street;
      const city = input.city || existingRestroom.city;
      const state = input.state || existingRestroom.state;
      const country = input.country || existingRestroom.country;

      const { latitude, longitude } = await geocodeAddress(street, city, state, country);

      if (latitude !== null && longitude !== null) {
        const latAttrName = `#attr${attributeCounter}`;
        const latAttrValue = `:val${attributeCounter}`;
        expressionAttributeNames[latAttrName] = 'latitude';
        expressionAttributeValues[latAttrValue] = latitude;
        updateExpressions.push(`${latAttrName} = ${latAttrValue}`);
        attributeCounter++;

        const lngAttrName = `#attr${attributeCounter}`;
        const lngAttrValue = `:val${attributeCounter}`;
        expressionAttributeNames[lngAttrName] = 'longitude';
        expressionAttributeValues[lngAttrValue] = longitude;
        updateExpressions.push(`${lngAttrName} = ${lngAttrValue}`);
        attributeCounter++;
      }
    }

    // Always update the updatedAt timestamp
    const updatedAtName = `#attr${attributeCounter}`;
    const updatedAtValue = `:val${attributeCounter}`;
    expressionAttributeNames[updatedAtName] = 'updatedAt';
    expressionAttributeValues[updatedAtValue] = new Date().toISOString();
    updateExpressions.push(`${updatedAtName} = ${updatedAtValue}`);

    if (updateExpressions.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Update the restroom
    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const updateResponse = await docClient.send(updateCommand);

    console.log('Restroom updated:', id);
    return updateResponse.Attributes;

  } catch (error) {
    console.error('Error updating restroom:', error);
    throw new Error(`Failed to update restroom: ${error.message}`);
  }
};
