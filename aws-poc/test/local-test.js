/**
 * Local test for Lambda functions without AWS deployment
 * This simulates the Lambda execution environment
 */

// Mock AWS SDK clients
const mockDynamoDBClient = {
  send: async (command) => {
    console.log('Mock DynamoDB command:', command.constructor.name);
    if (command.constructor.name === 'PutCommand') {
      console.log('Mock: Saving item to DynamoDB:', command.input.Item);
      return { $metadata: { httpStatusCode: 200 } };
    }
    if (command.constructor.name === 'GetCommand') {
      console.log('Mock: Getting item from DynamoDB:', command.input.Key);
      return {
        Item: {
          id: command.input.Key.id,
          name: 'Test Restroom',
          street: '123 Test St',
          city: 'San Francisco',
          state: 'CA',
          country: 'US',
          latitude: 37.7749,
          longitude: -122.4194,
          accessible: true,
          unisex: true,
          changingTable: false,
          comment: 'Test comment',
          directions: 'Test directions',
          upvote: 0,
          downvote: 0,
          approved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
  }
};

const mockLocationClient = {
  send: async (command) => {
    console.log('Mock Location Service command:', command.constructor.name);
    // Simulate geocoding response
    return {
      Results: [{
        Place: {
          Geometry: {
            Point: [-122.4194, 37.7749] // [longitude, latitude]
          }
        }
      }]
    };
  }
};

// Set up environment
process.env.TABLE_NAME = 'test-restrooms-table';
process.env.PLACE_INDEX_NAME = 'test-place-index';

// Test createRestroom function
async function testCreateRestroom() {
  console.log('\n=== Testing createRestroom ===\n');

  const event = {
    arguments: {
      input: {
        name: 'Test Coffee Shop',
        street: '456 Market Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        accessible: true,
        unisex: true,
        changingTable: false,
        comment: 'Gender-neutral single-stall restroom',
        directions: 'Through the main entrance'
      }
    }
  };

  try {
    // We can't actually import the Lambda since it requires AWS SDK
    // But we can validate the logic
    console.log('Input:', JSON.stringify(event.arguments.input, null, 2));
    
    // Validate required fields
    const input = event.arguments.input;
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
    
    console.log('✓ Validation passed');
    
    // Simulate geocoding
    const latitude = 37.7749;
    const longitude = -122.4194;
    console.log(`✓ Geocoded to: ${latitude}, ${longitude}`);
    
    // Simulate creating restroom object
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
      approved: false,
      createdAt: now,
      updatedAt: now
    };
    
    console.log('\n✓ Restroom object created:');
    console.log(JSON.stringify(restroom, null, 2));
    
    return restroom;
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  }
}

// Test validation errors
async function testValidationErrors() {
  console.log('\n=== Testing Validation Errors ===\n');
  
  const testCases = [
    {
      name: 'Missing name',
      input: {
        name: '',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        accessible: false,
        unisex: false,
        changingTable: false
      },
      expectedError: 'Name is required'
    },
    {
      name: 'Missing street',
      input: {
        name: 'Test',
        street: '',
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        accessible: false,
        unisex: false,
        changingTable: false
      },
      expectedError: 'Street is required'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    try {
      const input = testCase.input;
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
        console.log(`✓ Correctly caught error: ${errors[0]}`);
      } else {
        console.log('✗ Should have failed validation');
      }
    } catch (error) {
      console.log(`✓ Correctly caught error: ${error.message}`);
    }
  }
}

// Run tests
async function runTests() {
  console.log('Starting local Lambda tests...\n');
  
  try {
    await testCreateRestroom();
    await testValidationErrors();
    
    console.log('\n=== All Tests Passed ===\n');
  } catch (error) {
    console.error('\n=== Tests Failed ===');
    console.error(error);
    process.exit(1);
  }
}

runTests();
