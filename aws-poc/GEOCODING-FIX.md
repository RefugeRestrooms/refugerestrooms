# Geocoding Fix - AWS Location Service

## What Was Missing

The AWS Location Service Place Index wasn't being created, so addresses couldn't be geocoded to latitude/longitude coordinates.

## What Was Added

✅ **Place Index Resource**: Creates an Esri-based place index for geocoding
✅ **IAM Permissions**: Lambda now has specific permission to use the Place Index
✅ **Outputs**: Place Index name and ARN are now displayed after deployment

## Deploy the Fix

```bash
cd aws-poc/cdk
npm run build
cdk deploy --profile personal
```

CDK will show you the changes:
- ✅ Create Place Index
- ✅ Update Lambda IAM role with specific permissions

Type `y` to confirm.

## After Deployment

You'll see new outputs:
```
RefugeRestroomsPoc-dev.PlaceIndexName = refuge-restrooms-places-dev
RefugeRestroomsPoc-dev.PlaceIndexArn = arn:aws:geo:us-east-1:922971157863:place-index/refuge-restrooms-places-dev
```

## Test Geocoding

```bash
cd ../test
./test-api.sh \
  "https://xq4dmzbpijdmzc32xakiowaoki.appsync-api.us-east-1.amazonaws.com/graphql" \
  "da2-5uqzwpsr3ffmposqnkug3td3q4"
```

Now when you create a restroom, you should see:
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

## How It Works

1. **User submits**: Address (street, city, state, country)
2. **Lambda calls**: AWS Location Service Place Index
3. **Place Index returns**: Latitude and longitude coordinates
4. **Lambda stores**: Complete restroom data with coordinates in DynamoDB

## Cost

AWS Location Service pricing:
- **Geocoding**: $0.50 per 1,000 requests
- **Free tier**: 5,000 requests per month for first 12 months

For this POC, cost will be negligible (< $1).

## Troubleshooting

### Still getting null coordinates?

Check Lambda logs:
```bash
aws logs tail /aws/lambda/refuge-create-restroom-dev --follow --profile personal
```

Look for:
- ✅ "Geocoded to: lat, lng" - Success
- ❌ "Geocoding error" - Check permissions
- ❌ "No place index configured" - Place Index not created

### Permission errors?

Verify the Lambda has permissions:
```bash
aws lambda get-policy \
  --function-name refuge-create-restroom-dev \
  --profile personal
```

### Place Index not found?

Verify it was created:
```bash
aws location describe-place-index \
  --index-name refuge-restrooms-places-dev \
  --profile personal
```

## Alternative: Use Google Maps API

If you prefer Google Maps geocoding instead of AWS Location Service, you can:

1. Get a Google Maps API key
2. Update Lambda environment variable:
   ```typescript
   environment: {
     TABLE_NAME: restroomsTable.tableName,
     GOOGLE_MAPS_API_KEY: 'your-api-key',
   }
   ```
3. Modify Lambda code to use Google Maps Geocoding API

AWS Location Service is recommended because:
- ✅ No API key management
- ✅ Integrated IAM permissions
- ✅ Better for AWS-native applications
- ✅ Competitive pricing
