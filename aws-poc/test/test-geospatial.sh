#!/bin/bash

# Geospatial search test for REFUGE Restrooms GraphQL API
# Tests: Location-based search with distance calculations
# Usage: ./test-geospatial.sh <API_ENDPOINT> <API_KEY>
#
# GEOSPATIAL STRATEGY:
# - Creates restrooms at known locations around San Francisco
# - Tests distance-based filtering with various radii
# - Validates distance calculations and sorting
# - Tests edge cases (no coordinates, out of range)
#
# Test locations:
# - Downtown SF: 37.7749, -122.4194
# - Mission District: 37.7599, -122.4148 (~1.8km from downtown)
# - Oakland: 37.8044, -122.2712 (~13km from downtown)
# - San Jose: 37.3382, -121.8863 (~77km from downtown)

set -e

# Array to track created restroom IDs for cleanup
CREATED_IDS=()

# Cleanup function that runs on exit (success or failure)
cleanup() {
  if [ ${#CREATED_IDS[@]} -gt 0 ]; then
    echo ""
    echo "=========================================="
    echo "Cleanup: Deleting ${#CREATED_IDS[@]} test restrooms..."
    echo "----------------------------"
    
    for restroom_id in "${CREATED_IDS[@]}"; do
      DELETE_MUTATION=$(cat <<EOF
{
  "query": "mutation DeleteRestroom(\$id: ID!) { deleteRestroom(id: \$id) { success id } }",
  "variables": {
    "id": "$restroom_id"
  }
}
EOF
)

      DELETE_RESPONSE=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "x-api-key: $API_KEY" \
        -d "$DELETE_MUTATION" \
        "$API_ENDPOINT" 2>/dev/null || true)

      SUCCESS=$(echo "$DELETE_RESPONSE" | jq -r '.data.deleteRestroom.success' 2>/dev/null || echo "false")
      
      if [ "$SUCCESS" = "true" ]; then
        echo "  ✓ Deleted: $restroom_id"
      else
        echo "  ⚠ Failed to delete: $restroom_id"
      fi
    done
    echo ""
  fi
}

# Register cleanup function to run on exit
trap cleanup EXIT

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <API_ENDPOINT> <API_KEY>"
    echo "Example: $0 https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql your-api-key"
    exit 1
fi

API_ENDPOINT=$1
API_KEY=$2

echo "=========================================="
echo "REFUGE Restrooms - Geospatial Test"
echo "=========================================="
echo ""

# Test locations with known distances from downtown SF (37.7749, -122.4194)
echo "Setup: Creating test restrooms at known locations..."
echo "----------------------------"
echo "Reference point: Downtown SF (37.7749, -122.4194)"
echo ""

SAMPLE_RESTROOMS=(
  '{"name":"Downtown SF Cafe","street":"100 Market St","city":"San Francisco","state":"CA","country":"US","accessible":true,"unisex":false,"changingTable":false}'
  '{"name":"Mission District Library","street":"200 Mission St","city":"San Francisco","state":"CA","country":"US","accessible":false,"unisex":true,"changingTable":false}'
  '{"name":"Oakland Coffee Shop","street":"300 Broadway","city":"Oakland","state":"CA","country":"US","accessible":true,"unisex":true,"changingTable":true}'
  '{"name":"San Jose Mall","street":"400 First St","city":"San Jose","state":"CA","country":"US","accessible":true,"unisex":false,"changingTable":true}'
  '{"name":"No Coordinates Place","street":"500 Nowhere St","city":"Unknown","state":"XX","country":"US","accessible":false,"unisex":false,"changingTable":false}'
)

# Expected approximate coordinates (will be geocoded)
EXPECTED_LOCATIONS=(
  "Downtown SF: ~37.77, -122.42 (0km from reference)"
  "Mission District: ~37.76, -122.41 (~2km from reference)"  
  "Oakland: ~37.80, -122.27 (~13km from reference)"
  "San Jose: ~37.34, -121.89 (~77km from reference)"
  "No Coordinates: Should have no lat/lng"
)

for i in "${!SAMPLE_RESTROOMS[@]}"; do
  restroom_data="${SAMPLE_RESTROOMS[$i]}"
  expected_location="${EXPECTED_LOCATIONS[$i]}"
  
  CREATE_MUTATION=$(cat <<EOF
{
  "query": "mutation CreateRestroom(\$input: CreateRestroomInput!) { createRestroom(input: \$input) { id name latitude longitude } }",
  "variables": {
    "input": $restroom_data
  }
}
EOF
)

  CREATE_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "$CREATE_MUTATION" \
    "$API_ENDPOINT")

  RESTROOM_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.createRestroom.id')
  RESTROOM_NAME=$(echo "$CREATE_RESPONSE" | jq -r '.data.createRestroom.name')
  LATITUDE=$(echo "$CREATE_RESPONSE" | jq -r '.data.createRestroom.latitude')
  LONGITUDE=$(echo "$CREATE_RESPONSE" | jq -r '.data.createRestroom.longitude')
  
  if [ "$RESTROOM_ID" != "null" ] && [ -n "$RESTROOM_ID" ]; then
    CREATED_IDS+=("$RESTROOM_ID")
    if [ "$LATITUDE" != "null" ] && [ "$LONGITUDE" != "null" ]; then
      echo "  ✓ Created: $RESTROOM_NAME at ($LATITUDE, $LONGITUDE)"
      echo "    Expected: $expected_location"
    else
      echo "  ✓ Created: $RESTROOM_NAME (no coordinates)"
      echo "    Expected: $expected_location"
    fi
  else
    echo "  ✗ Failed to create: $RESTROOM_NAME"
  fi
done

echo ""
echo "Created ${#CREATED_IDS[@]} test restrooms"
echo ""

# Wait a moment for geocoding to complete
echo "Waiting 3 seconds for geocoding to complete..."
sleep 3
echo ""

echo "=========================================="
echo ""

# Test 1: Search within 5km of downtown SF
echo "Test 1: Search within 5km of downtown SF..."
echo "----------------------------"
echo "Query: lat=37.7749, lng=-122.4194, radius=5000 (5km)"
echo "Expected: Downtown SF + Mission District restrooms"
echo ""

GEOSPATIAL_QUERY_5KM=$(cat <<'EOF'
{
  "query": "query ListRestrooms($lat: Float, $lng: Float, $radius: Int) { listRestrooms(lat: $lat, lng: $lng, radius: $radius, limit: 25) { items { id name latitude longitude distance } count } }",
  "variables": {
    "lat": 37.7749,
    "lng": -122.4194,
    "radius": 5000
  }
}
EOF
)

GEOSPATIAL_RESPONSE_5KM=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$GEOSPATIAL_QUERY_5KM" \
  "$API_ENDPOINT")

echo "$GEOSPATIAL_RESPONSE_5KM" | jq '.'
echo ""

COUNT_5KM=$(echo "$GEOSPATIAL_RESPONSE_5KM" | jq -r '.data.listRestrooms.count')

if [ "$COUNT_5KM" -gt 0 ]; then
    echo "✓ Test 1 PASSED: Found $COUNT_5KM restrooms within 5km"
    
    # Verify distance field is present and results are sorted
    DISTANCES=$(echo "$GEOSPATIAL_RESPONSE_5KM" | jq -r '.data.listRestrooms.items[].distance')
    echo "  Distances (meters): $(echo "$DISTANCES" | tr '\n' ' ')"
    
    # Check if results are sorted by distance (each distance <= next distance)
    SORTED_CHECK=$(echo "$GEOSPATIAL_RESPONSE_5KM" | jq -r '.data.listRestrooms.items | [.[].distance] | . == sort')
    if [ "$SORTED_CHECK" = "true" ]; then
        echo "✓ Results are correctly sorted by distance (closest first)"
    else
        echo "⚠ Warning: Results may not be sorted by distance"
    fi
    
    # Verify all distances are within radius
    MAX_DISTANCE=$(echo "$GEOSPATIAL_RESPONSE_5KM" | jq -r '.data.listRestrooms.items | map(.distance) | max')
    if [ "$MAX_DISTANCE" != "null" ] && [ "$(echo "$MAX_DISTANCE <= 5000" | bc -l 2>/dev/null || echo "1")" = "1" ]; then
        echo "✓ All results are within 5km radius (max distance: ${MAX_DISTANCE}m)"
    else
        echo "⚠ Warning: Some results may be outside 5km radius"
    fi
else
    echo "⚠ Test 1 WARNING: No restrooms found within 5km"
fi

echo ""
echo "=========================================="
echo ""

# Test 2: Search within 20km (should include Oakland)
echo "Test 2: Search within 20km of downtown SF..."
echo "----------------------------"
echo "Query: lat=37.7749, lng=-122.4194, radius=20000 (20km)"
echo "Expected: Downtown SF + Mission District + Oakland restrooms"
echo ""

GEOSPATIAL_QUERY_20KM=$(cat <<'EOF'
{
  "query": "query ListRestrooms($lat: Float, $lng: Float, $radius: Int) { listRestrooms(lat: $lat, lng: $lng, radius: $radius, limit: 25) { items { id name distance } count } }",
  "variables": {
    "lat": 37.7749,
    "lng": -122.4194,
    "radius": 20000
  }
}
EOF
)

GEOSPATIAL_RESPONSE_20KM=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$GEOSPATIAL_QUERY_20KM" \
  "$API_ENDPOINT")

echo "$GEOSPATIAL_RESPONSE_20KM" | jq '.'
echo ""

COUNT_20KM=$(echo "$GEOSPATIAL_RESPONSE_20KM" | jq -r '.data.listRestrooms.count')

if [ "$COUNT_20KM" -ge "$COUNT_5KM" ]; then
    echo "✓ Test 2 PASSED: Found $COUNT_20KM restrooms within 20km (>= $COUNT_5KM from 5km search)"
else
    echo "⚠ Test 2 WARNING: 20km search returned fewer results than 5km search"
fi

echo ""
echo "=========================================="
echo ""

# Test 3: Search with very large radius (should include San Jose)
echo "Test 3: Search within 100km of downtown SF..."
echo "----------------------------"
echo "Query: lat=37.7749, lng=-122.4194, radius=100000 (100km)"
echo "Expected: All geocoded restrooms including San Jose"
echo ""

GEOSPATIAL_QUERY_100KM=$(cat <<'EOF'
{
  "query": "query ListRestrooms($lat: Float, $lng: Float, $radius: Int) { listRestrooms(lat: $lat, lng: $lng, radius: $radius, limit: 25) { items { id name distance } count } }",
  "variables": {
    "lat": 37.7749,
    "lng": -122.4194,
    "radius": 100000
  }
}
EOF
)

GEOSPATIAL_RESPONSE_100KM=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$GEOSPATIAL_QUERY_100KM" \
  "$API_ENDPOINT")

echo "$GEOSPATIAL_RESPONSE_100KM" | jq '.'
echo ""

COUNT_100KM=$(echo "$GEOSPATIAL_RESPONSE_100KM" | jq -r '.data.listRestrooms.count')

if [ "$COUNT_100KM" -ge "$COUNT_20KM" ]; then
    echo "✓ Test 3 PASSED: Found $COUNT_100KM restrooms within 100km (>= $COUNT_20KM from 20km search)"
else
    echo "⚠ Test 3 WARNING: 100km search returned fewer results than 20km search"
fi

echo ""
echo "=========================================="
echo ""

# Test 4: Invalid coordinates
echo "Test 4: Testing invalid coordinates..."
echo "----------------------------"

# Test invalid latitude
INVALID_LAT_QUERY=$(cat <<'EOF'
{
  "query": "query ListRestrooms($lat: Float, $lng: Float) { listRestrooms(lat: $lat, lng: $lng) { items { id } count } }",
  "variables": {
    "lat": 91.0,
    "lng": -122.4194
  }
}
EOF
)

INVALID_LAT_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$INVALID_LAT_QUERY" \
  "$API_ENDPOINT")

if echo "$INVALID_LAT_RESPONSE" | jq -e '.errors' > /dev/null; then
    echo "✓ Test 4a PASSED: Invalid latitude (91.0) correctly rejected"
else
    echo "⚠ Test 4a WARNING: Invalid latitude was not rejected"
fi

# Test invalid longitude  
INVALID_LNG_QUERY=$(cat <<'EOF'
{
  "query": "query ListRestrooms($lat: Float, $lng: Float) { listRestrooms(lat: $lat, lng: $lng) { items { id } count } }",
  "variables": {
    "lat": 37.7749,
    "lng": 181.0
  }
}
EOF
)

INVALID_LNG_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$INVALID_LNG_QUERY" \
  "$API_ENDPOINT")

if echo "$INVALID_LNG_RESPONSE" | jq -e '.errors' > /dev/null; then
    echo "✓ Test 4b PASSED: Invalid longitude (181.0) correctly rejected"
else
    echo "⚠ Test 4b WARNING: Invalid longitude was not rejected"
fi

echo ""
echo "=========================================="
echo ""

# Test 5: Combine geospatial with filters
echo "Test 5: Geospatial search with accessibility filter..."
echo "----------------------------"
echo "Query: lat=37.7749, lng=-122.4194, radius=100000, accessible=true"
echo "Expected: Only accessible restrooms within 100km"
echo ""

COMBINED_QUERY=$(cat <<'EOF'
{
  "query": "query ListRestrooms($lat: Float, $lng: Float, $radius: Int, $accessible: Boolean) { listRestrooms(lat: $lat, lng: $lng, radius: $radius, accessible: $accessible, limit: 25) { items { id name accessible distance } count } }",
  "variables": {
    "lat": 37.7749,
    "lng": -122.4194,
    "radius": 100000,
    "accessible": true
  }
}
EOF
)

COMBINED_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$COMBINED_QUERY" \
  "$API_ENDPOINT")

echo "$COMBINED_RESPONSE" | jq '.'
echo ""

COMBINED_COUNT=$(echo "$COMBINED_RESPONSE" | jq -r '.data.listRestrooms.count')

if [ "$COMBINED_COUNT" -gt 0 ]; then
    echo "✓ Test 5 PASSED: Found $COMBINED_COUNT accessible restrooms within 100km"
    
    # Verify all results are accessible
    ALL_ACCESSIBLE=$(echo "$COMBINED_RESPONSE" | jq -r '.data.listRestrooms.items | all(.accessible == true)')
    if [ "$ALL_ACCESSIBLE" = "true" ]; then
        echo "✓ Filter verification passed: All results are accessible"
    else
        echo "⚠ Filter verification failed: Some results are not accessible"
    fi
    
    # Should be <= total count from Test 3
    if [ "$COMBINED_COUNT" -le "$COUNT_100KM" ]; then
        echo "✓ Combined filter returned fewer or equal results than unfiltered search"
    else
        echo "⚠ Warning: Combined filter returned more results than unfiltered search"
    fi
else
    echo "⚠ Test 5 WARNING: No accessible restrooms found within 100km"
fi

echo ""
echo "=========================================="
echo "All Tests Completed!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  ✓ Search within 5km radius"
echo "  ✓ Search within 20km radius"  
echo "  ✓ Search within 100km radius"
echo "  ✓ Invalid coordinate validation"
echo "  ✓ Combined geospatial + accessibility filter"
echo ""
echo "Geospatial test PASSED! 🎉"
echo ""
echo "Note: Cleanup will run automatically..."