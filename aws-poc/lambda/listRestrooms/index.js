const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.TABLE_NAME;
const DEFAULT_LIMIT = 25;
const DEFAULT_RADIUS = 20000; // 20km in meters

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

/**
 * Perform full-text search on restroom data
 * @param {Object} item - Restroom item from DynamoDB
 * @param {string} searchQuery - Search query string
 * @returns {Object|null} Item with relevance score or null if no match
 */
function performTextSearch(item, searchQuery) {
  if (!searchQuery || searchQuery.trim() === '') {
    return { ...item, relevanceScore: 0 };
  }

  // Normalize search query
  const query = searchQuery.toLowerCase().trim();
  const searchTerms = query.split(/\s+/).filter(term => term.length > 0);

  // Define searchable fields with weights (higher weight = more important)
  const searchableFields = [
    { field: 'name', weight: 3.0 },
    { field: 'street', weight: 2.0 },
    { field: 'city', weight: 2.0 },
    { field: 'state', weight: 1.5 },
    { field: 'comment', weight: 1.0 },
    { field: 'directions', weight: 1.0 },
    { field: 'country', weight: 0.5 }
  ];

  let totalScore = 0;
  let matchedTerms = 0;

  // Calculate relevance score
  for (const { field, weight } of searchableFields) {
    const fieldValue = (item[field] || '').toLowerCase();
    
    for (const term of searchTerms) {
      if (fieldValue.includes(term)) {
        // Exact word match gets higher score
        const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, 'i');
        if (wordBoundaryRegex.test(fieldValue)) {
          totalScore += weight * 2; // Bonus for exact word match
        } else {
          totalScore += weight; // Partial match
        }
        matchedTerms++;
      }
    }
  }

  // Only return items that match at least one search term
  if (matchedTerms === 0) {
    return null;
  }

  // Normalize score based on number of search terms and field matches
  const relevanceScore = totalScore / searchTerms.length;

  return {
    ...item,
    relevanceScore: Math.round(relevanceScore * 100) / 100 // Round to 2 decimal places
  };
}

/**
 * Lambda handler for listing restrooms with pagination
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const { 
      limit, 
      nextToken, 
      accessible, 
      unisex, 
      changingTable,
      lat,
      lng,
      radius,
      query
    } = event.arguments || {};

    // Validate geospatial parameters
    const isGeospatialQuery = lat !== undefined && lng !== undefined;
    if (isGeospatialQuery) {
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        throw new Error('Latitude and longitude must be numbers');
      }
      if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      if (lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
    }

    // Validate search query
    const isTextSearchQuery = query !== undefined && query !== null && query.trim() !== '';
    if (isTextSearchQuery && typeof query !== 'string') {
      throw new Error('Search query must be a string');
    }

    // Build scan parameters
    const scanParams = {
      TableName: TABLE_NAME,
      Limit: limit || DEFAULT_LIMIT,
    };

    // Add pagination token if provided
    if (nextToken) {
      try {
        scanParams.ExclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString('utf-8'));
      } catch (error) {
        console.error('Invalid nextToken:', error);
        throw new Error('Invalid pagination token');
      }
    }

    // Build filter expression for optional filters
    const filterExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    if (accessible !== undefined && accessible !== null) {
      filterExpressions.push('#accessible = :accessible');
      expressionAttributeNames['#accessible'] = 'accessible';
      expressionAttributeValues[':accessible'] = accessible;
    }

    if (unisex !== undefined && unisex !== null) {
      filterExpressions.push('#unisex = :unisex');
      expressionAttributeNames['#unisex'] = 'unisex';
      expressionAttributeValues[':unisex'] = unisex;
    }

    if (changingTable !== undefined && changingTable !== null) {
      filterExpressions.push('#changingTable = :changingTable');
      expressionAttributeNames['#changingTable'] = 'changingTable';
      expressionAttributeValues[':changingTable'] = changingTable;
    }

    // Apply filters if any exist
    if (filterExpressions.length > 0) {
      scanParams.FilterExpression = filterExpressions.join(' AND ');
      scanParams.ExpressionAttributeNames = expressionAttributeNames;
      scanParams.ExpressionAttributeValues = expressionAttributeValues;
    }

    // Execute scan
    const result = await docClient.send(new ScanCommand(scanParams));
    let items = result.Items || [];

    // Handle text search filtering and scoring
    if (isTextSearchQuery) {
      items = items
        .map(item => performTextSearch(item, query))
        .filter(item => item !== null)
        .sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by relevance (highest first)

      console.log(`Text search query "${query}": ${items.length} matching restrooms`);
    }

    // Handle geospatial filtering and sorting
    if (isGeospatialQuery) {
      const searchRadius = radius || DEFAULT_RADIUS;
      
      // Filter items by distance and add distance field
      items = items
        .map(item => {
          // Skip items without coordinates
          if (!item.latitude || !item.longitude) {
            return null;
          }
          
          const distance = calculateDistance(lat, lng, item.latitude, item.longitude);
          
          // Only include items within radius
          if (distance <= searchRadius) {
            return {
              ...item,
              distance: Math.round(distance) // Round to nearest meter
            };
          }
          
          return null;
        })
        .filter(item => item !== null);

      // Sort by distance if geospatial, or maintain relevance score if both text and geo
      if (isTextSearchQuery) {
        // For combined queries, sort by relevance first, then distance
        items.sort((a, b) => {
          const scoreDiff = b.relevanceScore - a.relevanceScore;
          if (Math.abs(scoreDiff) < 0.1) { // If relevance scores are close, sort by distance
            return a.distance - b.distance;
          }
          return scoreDiff;
        });
      } else {
        // Pure geospatial query: sort by distance only
        items.sort((a, b) => a.distance - b.distance);
      }

      console.log(`Geospatial query: ${items.length} restrooms within ${searchRadius}m of (${lat}, ${lng})`);
    }

    // Handle pagination for search queries (text or geospatial)
    let paginatedItems = items;
    let encodedNextToken = null;
    
    if (isGeospatialQuery || isTextSearchQuery) {
      // For search queries, we handle pagination in memory since we need custom sorting
      // Note: This approach works for moderate datasets but may need optimization for large datasets
      const requestedLimit = limit || DEFAULT_LIMIT;
      const startIndex = nextToken ? parseInt(Buffer.from(nextToken, 'base64').toString('utf-8')) : 0;
      const endIndex = startIndex + requestedLimit;
      
      paginatedItems = items.slice(startIndex, endIndex);
      
      // Create next token if there are more items
      if (endIndex < items.length) {
        encodedNextToken = Buffer.from(endIndex.toString()).toString('base64');
      }
    } else {
      // For simple filter queries, use DynamoDB's native pagination
      if (result.LastEvaluatedKey) {
        encodedNextToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
      }
      paginatedItems = items;
    }

    console.log(`Retrieved ${paginatedItems.length} restrooms, hasMore: ${!!encodedNextToken}`);

    // Return paginated response
    return {
      items: paginatedItems,
      nextToken: encodedNextToken,
      count: paginatedItems.length,
    };

  } catch (error) {
    console.error('Error listing restrooms:', error);
    throw new Error(`Failed to list restrooms: ${error.message}`);
  }
};
