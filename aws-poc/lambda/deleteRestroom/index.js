const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.TABLE_NAME;

/**
 * Lambda handler for deleting a restroom by ID
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const { id } = event.arguments;

    if (!id) {
      throw new Error('Restroom ID is required');
    }

    // First, check if the restroom exists
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    });

    const getResponse = await docClient.send(getCommand);

    if (!getResponse.Item) {
      return {
        success: false,
        message: `Restroom not found: ${id}`,
        id: null
      };
    }

    // Delete the restroom
    const deleteCommand = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
      // Optional: Use ConditionExpression to ensure item exists
      ConditionExpression: 'attribute_exists(id)'
    });

    await docClient.send(deleteCommand);

    console.log('Restroom deleted:', id);

    return {
      success: true,
      message: `Restroom successfully deleted: ${id}`,
      id
    };

  } catch (error) {
    console.error('Error deleting restroom:', error);
    
    // Handle conditional check failure
    if (error.name === 'ConditionalCheckFailedException') {
      return {
        success: false,
        message: `Restroom not found or already deleted: ${event.arguments.id}`,
        id: null
      };
    }

    throw new Error(`Failed to delete restroom: ${error.message}`);
  }
};
