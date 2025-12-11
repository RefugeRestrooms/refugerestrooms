const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.TABLE_NAME;

/**
 * Lambda handler for getting a restroom by ID
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const { id } = event.arguments;

    if (!id) {
      throw new Error('Restroom ID is required');
    }

    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    });

    const response = await docClient.send(command);

    if (!response.Item) {
      throw new Error(`Restroom not found: ${id}`);
    }

    return response.Item;

  } catch (error) {
    console.error('Error getting restroom:', error);
    throw new Error(`Failed to get restroom: ${error.message}`);
  }
};
