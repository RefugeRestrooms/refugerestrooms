# Design Document

## Overview

The React Frontend Application is a modern, responsive web interface for the REFUGE Restrooms service. Built with React 18, Vite, and Apollo Client, it provides users with an intuitive way to search for, view, and contribute restroom information. The application is architected with component reusability in mind, enabling future code sharing with React Native mobile applications.

The frontend connects to an existing AWS AppSync GraphQL API that manages restroom data through Lambda functions and DynamoDB storage. The application emphasizes accessibility, performance, and user experience while maintaining the community-driven mission of providing safe restroom access information.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   Apollo Client  │    │  GraphQL API    │
│   (Vite)        │◄──►│   (GraphQL)      │◄──►│  (AWS AppSync)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Component      │    │   State Mgmt     │    │   Lambda        │
│  Library        │    │   (Apollo Cache) │    │   Functions     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Shared UI      │    │   Local Storage  │    │   DynamoDB      │
│  Components     │    │   (Offline)      │    │   Tables        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **GraphQL Client**: Apollo Client for API communication and caching
- **Styling**: CSS Modules with PostCSS for component-scoped styles
- **State Management**: Apollo Client cache with React Context for UI state
- **Routing**: React Router v6 for client-side navigation
- **Location Services**: Browser Geolocation API with fallback to manual entry
- **Testing**: Vitest for unit tests, React Testing Library for component tests

## Components and Interfaces

### Core Components

#### 1. Application Shell
- **AppRouter**: Main routing component managing navigation between pages
- **Layout**: Common layout wrapper with navigation and footer
- **ErrorBoundary**: Global error handling and recovery interface
- **LoadingProvider**: Centralized loading state management

#### 2. Search Components
- **SearchInterface**: Location input with autocomplete and geolocation
- **FilterPanel**: Accessibility and feature filters (wheelchair, unisex, changing table)
- **SortControls**: Distance, rating, and alphabetical sorting options
- **SearchResults**: Paginated list of restroom cards with distance display

#### 3. Restroom Components
- **RestroomCard**: Summary view for search results and lists
- **RestroomDetail**: Full restroom information display
- **RestroomForm**: Creation and editing interface for restroom data
- **AccessibilityBadges**: Visual indicators for accessibility features

#### 4. Feedback Components
- **FeedbackForm**: Rating and comment submission interface
- **FeedbackDisplay**: Aggregated ratings and recent comments
- **FeedbackSummary**: Overall scores and confidence indicators

#### 5. Shared UI Components (React Native Compatible)
- **Button**: Consistent button styling and behavior
- **Input**: Form input components with validation
- **Modal**: Overlay dialogs and confirmations
- **Toast**: Notification system for user feedback
- **Icon**: SVG icon system with accessibility support

### GraphQL Interface Layer

#### Apollo Client Configuration
```typescript
interface ApolloConfig {
  uri: string;           // GraphQL endpoint URL
  apiKey: string;        // AWS AppSync API key
  cache: InMemoryCache;  // Apollo cache configuration
  errorPolicy: string;   // Error handling strategy
}
```

#### Query Interfaces
```typescript
interface ListRestroomsQuery {
  lat?: number;
  lng?: number;
  radius?: number;
  accessible?: boolean;
  unisex?: boolean;
  changingTable?: boolean;
  query?: string;
  limit?: number;
  nextToken?: string;
}

interface RestroomResponse {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  accessible: boolean;
  unisex: boolean;
  changingTable: boolean;
  comment?: string;
  directions?: string;
  upvote: number;
  downvote: number;
  distance?: number;
  overallScore?: number;
  safetyScore?: number;
  totalFeedback?: number;
  confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
}
```

#### Mutation Interfaces
```typescript
interface CreateRestroomInput {
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  accessible: boolean;
  unisex: boolean;
  changingTable: boolean;
  comment?: string;
  directions?: string;
}

interface FeedbackInput {
  restroomId: string;
  positive: boolean;
  reasons: FeedbackReason[];
  comment?: string;
}
```

## Data Models

### Client-Side Data Models

#### Restroom Model
```typescript
interface Restroom {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  features: {
    accessible: boolean;
    unisex: boolean;
    changingTable: boolean;
  };
  metadata: {
    comment?: string;
    directions?: string;
    upvote: number;
    downvote: number;
    approved: boolean;
  };
  analytics?: {
    distance?: number;
    overallScore?: number;
    safetyScore?: number;
    totalFeedback?: number;
    confidence?: FeedbackConfidence;
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
}
```

#### Search State Model
```typescript
interface SearchState {
  query: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  filters: {
    accessible?: boolean;
    unisex?: boolean;
    changingTable?: boolean;
    radius: number;
  };
  sorting: {
    field: 'distance' | 'rating' | 'name';
    direction: 'asc' | 'desc';
  };
  pagination: {
    limit: number;
    nextToken?: string;
  };
}
```

#### User Interface State
```typescript
interface UIState {
  loading: {
    search: boolean;
    submit: boolean;
    feedback: boolean;
  };
  errors: {
    network?: string;
    validation?: Record<string, string>;
    location?: string;
  };
  modals: {
    feedback: boolean;
    confirmation: boolean;
  };
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: number;
  }>;
}
```

### Apollo Cache Schema

The Apollo Client cache will normalize and store GraphQL responses according to the schema types. Key cache policies include:

- **Restroom entities**: Cached by ID with 5-minute TTL for search results
- **Search results**: Cached by query parameters with 2-minute TTL
- **Feedback data**: Optimistic updates with server reconciliation
- **Location data**: Session-based caching for user location

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- **Search and API Integration**: Properties 1, 2, and 3 can be combined into comprehensive search behavior properties
- **Form Validation and Submission**: Properties 4, 5, and 6 can be consolidated into form handling properties  
- **Error Handling**: Multiple error-related properties can be unified into comprehensive error management properties
- **Filter and Sort Operations**: Properties 7, 8, 9, and 10 can be combined into data manipulation properties

### Core Properties

**Property 1: Location-based search integration**
*For any* valid location input (coordinates or address), the application should query the GraphQL API with correct parameters and display results sorted by distance
**Validates: Requirements 1.1, 1.2, 1.3**

**Property 2: Restroom detail navigation and display**
*For any* restroom selected from search results, the application should navigate to the detail view and display all restroom attributes including feedback data
**Validates: Requirements 2.1, 2.2, 2.3**

**Property 3: Feedback submission integration**
*For any* valid feedback input, the application should successfully submit the data to the GraphQL API and update the restroom's feedback display
**Validates: Requirements 2.4**

**Property 4: Form validation and submission**
*For any* restroom submission form, invalid inputs should be rejected with specific error messages, and valid inputs should be successfully submitted to the API
**Validates: Requirements 3.2, 3.3, 3.4**

**Property 5: Apollo Client integration and error handling**
*For any* GraphQL operation, the application should properly handle loading states, display appropriate error messages for failures, and prevent duplicate requests
**Validates: Requirements 5.2, 5.3, 5.5**

**Property 6: Filter and sort operations**
*For any* combination of filters and sorting options, the application should display only results matching all criteria and maintain filter state during sort operations
**Validates: Requirements 6.2, 6.3, 6.4**

**Property 7: Filter reset round-trip**
*For any* search results with applied filters, clearing all filters should restore the original unfiltered results
**Validates: Requirements 6.5**

**Property 8: Form submission state management**
*For any* form submission, the submit button should be disabled during the submission process to prevent duplicate submissions
**Validates: Requirements 7.3**

**Property 9: Loading state consistency**
*For any* data loading operation, appropriate loading indicators should be displayed and removed when the operation completes
**Validates: Requirements 7.4**

**Property 10: Accessibility compliance**
*For any* interactive element, proper ARIA labels and keyboard navigation should be implemented according to accessibility standards
**Validates: Requirements 7.5**

## Error Handling

### Error Categories and Strategies

#### 1. Network and API Errors
- **GraphQL Errors**: Display user-friendly messages for API failures
- **Network Connectivity**: Implement offline detection and caching
- **Timeout Handling**: Provide retry mechanisms for failed requests
- **Rate Limiting**: Handle API rate limits gracefully with user feedback

#### 2. Validation Errors
- **Form Validation**: Real-time validation with specific error messages
- **Data Type Errors**: Client-side type checking before API calls
- **Required Field Validation**: Clear indication of missing required data
- **Format Validation**: Address, coordinate, and text format validation

#### 3. Location Service Errors
- **Geolocation Denied**: Fallback to manual location entry
- **Geolocation Unavailable**: Alternative location input methods
- **Invalid Coordinates**: Validation and error messaging for location data
- **Geocoding Failures**: Graceful handling of address resolution errors

#### 4. User Interface Errors
- **Component Errors**: Error boundaries to prevent application crashes
- **State Inconsistencies**: Validation of UI state transitions
- **Navigation Errors**: Fallback routes for invalid navigation attempts
- **Accessibility Errors**: Graceful degradation for assistive technologies

### Error Recovery Mechanisms

#### Automatic Recovery
- **Retry Logic**: Exponential backoff for transient failures
- **Cache Fallback**: Use cached data when API is unavailable
- **State Restoration**: Preserve user input during error recovery
- **Connection Monitoring**: Automatic retry when connectivity is restored

#### User-Initiated Recovery
- **Manual Retry**: Clear retry buttons for failed operations
- **Alternative Actions**: Suggest alternative approaches when primary actions fail
- **Data Export**: Allow users to save their input before retry
- **Help Resources**: Contextual help for common error scenarios

## Testing Strategy

### Dual Testing Approach

The application will implement both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and error conditions
- **Property tests** verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Unit Testing Strategy

Unit tests will focus on:
- **Component Rendering**: Verify components render correctly with various props
- **User Interactions**: Test click handlers, form submissions, and navigation
- **Integration Points**: Apollo Client integration, browser API usage
- **Edge Cases**: Empty states, error conditions, boundary values
- **Accessibility**: Screen reader compatibility, keyboard navigation

**Testing Framework**: Vitest with React Testing Library
**Coverage Target**: 80% code coverage for critical paths
**Test Organization**: Co-located with components using `.test.tsx` suffix

### Property-Based Testing Strategy

Property-based tests will verify universal behaviors:
- **Search Operations**: All search inputs produce valid, sorted results
- **Form Validation**: All invalid inputs are properly rejected
- **Data Transformations**: All API responses are correctly processed
- **State Management**: All state transitions maintain consistency
- **Error Handling**: All error conditions produce appropriate user feedback

**Testing Framework**: Fast-check for property-based testing
**Test Configuration**: Minimum 100 iterations per property test
**Property Tagging**: Each test tagged with format: `**Feature: react-frontend-app, Property {number}: {property_text}**`

### Integration Testing

- **GraphQL Integration**: Test Apollo Client queries and mutations against mock API
- **Browser API Integration**: Test geolocation, local storage, and navigation APIs
- **Component Integration**: Test component interactions and data flow
- **End-to-End Workflows**: Test complete user journeys from search to submission

### Performance Testing

- **Bundle Size**: Monitor and optimize JavaScript bundle size
- **Render Performance**: Test component rendering performance with large datasets
- **Memory Usage**: Monitor memory leaks in long-running sessions
- **Network Efficiency**: Optimize GraphQL query efficiency and caching

### Accessibility Testing

- **Screen Reader Testing**: Verify compatibility with assistive technologies
- **Keyboard Navigation**: Test all functionality is accessible via keyboard
- **Color Contrast**: Ensure sufficient contrast ratios for visual elements
- **ARIA Compliance**: Validate proper ARIA labels and roles

Each correctness property will be implemented as a single property-based test, with tests placed as close to implementation as possible to catch errors early in development.
## De
ployment Architecture

### AWS Deployment Strategy

The React Frontend Application will be deployed as a static single-page application (SPA) using AWS services optimized for performance, scalability, and cost-effectiveness.

#### Recommended Deployment Stack

**Primary Option: S3 + CloudFront + Route 53**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Route 53      │    │   CloudFront     │    │   S3 Bucket     │
│   (DNS)         │◄──►│   (CDN)          │◄──►│   (Static Host) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Custom Domain  │    │   SSL/TLS        │    │   Build Assets  │
│  (refuge.app)   │    │   (Certificate)  │    │   (HTML/JS/CSS) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

#### Deployment Components

**1. Amazon S3 Static Website Hosting**
- **Purpose**: Host built React application assets (HTML, JS, CSS, images)
- **Configuration**: 
  - Static website hosting enabled
  - Index document: `index.html`
  - Error document: `index.html` (for SPA routing)
  - Public read access for website content
  - Versioning enabled for rollback capability

**2. Amazon CloudFront CDN**
- **Purpose**: Global content delivery and performance optimization
- **Configuration**:
  - Origin: S3 bucket website endpoint
  - Default root object: `index.html`
  - Custom error pages: Redirect 404s to `index.html` for SPA routing
  - Caching behavior: Long-term caching for assets, short-term for HTML
  - Compression: Gzip/Brotli compression enabled
  - Security headers: HSTS, CSP, X-Frame-Options

**3. AWS Certificate Manager (ACM)**
- **Purpose**: SSL/TLS certificates for HTTPS
- **Configuration**:
  - Domain validation certificate
  - Automatic renewal
  - CloudFront integration

**4. Route 53 DNS**
- **Purpose**: Domain name management and routing
- **Configuration**:
  - A record pointing to CloudFront distribution
  - AAAA record for IPv6 support
  - Health checks for monitoring

#### Alternative Deployment Options

**Option 2: AWS Amplify Hosting**
- **Pros**: Integrated CI/CD, branch-based deployments, built-in SSL
- **Cons**: Less control over caching, higher cost for high traffic
- **Use Case**: Rapid prototyping and development environments

**Option 3: S3 + CloudFront via CDK**
- **Pros**: Infrastructure as Code, version controlled deployment
- **Cons**: More complex initial setup
- **Use Case**: Production environments requiring infrastructure automation

#### Build and Deployment Pipeline

**1. Build Process**
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output: dist/ directory with optimized assets
```

**2. Deployment Steps**
```bash
# Sync build assets to S3
aws s3 sync dist/ s3://refuge-frontend-bucket --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

**3. CI/CD Integration**
- **GitHub Actions**: Automated deployment on main branch push
- **Environment Variables**: API endpoints, feature flags
- **Staging Environment**: Separate S3/CloudFront for testing
- **Blue/Green Deployment**: Zero-downtime deployments using CloudFront origins

#### Environment Configuration

**Development Environment**
- Local Vite dev server
- GraphQL API: Development endpoint
- Hot module replacement enabled
- Source maps enabled

**Staging Environment**
- S3 + CloudFront deployment
- GraphQL API: Staging endpoint
- Minified assets
- Error tracking enabled

**Production Environment**
- S3 + CloudFront deployment
- GraphQL API: Production endpoint
- Optimized assets with tree shaking
- Performance monitoring
- Error tracking and alerting

#### Security Considerations

**Content Security Policy (CSP)**
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
connect-src 'self' https://api.refuge.app;
img-src 'self' data: https:;
```

**CORS Configuration**
- S3 bucket CORS policy for API requests
- CloudFront headers for security
- API Gateway CORS settings alignment

**Access Control**
- S3 bucket policies restricting direct access
- CloudFront Origin Access Identity (OAI)
- IAM roles for deployment automation

#### Monitoring and Observability

**CloudWatch Metrics**
- CloudFront request metrics
- S3 bucket access logs
- Error rate monitoring
- Performance metrics

**Real User Monitoring (RUM)**
- CloudWatch RUM for client-side performance
- Core Web Vitals tracking
- Error tracking and reporting
- User journey analytics

#### Cost Optimization

**S3 Storage**
- Intelligent tiering for infrequently accessed assets
- Lifecycle policies for old versions
- Compression for text assets

**CloudFront**
- Price class optimization based on user geography
- Caching optimization to reduce origin requests
- Compression to reduce bandwidth costs

**Estimated Monthly Costs (Production)**
- S3 Storage: $5-10 (depending on asset size)
- CloudFront: $10-50 (depending on traffic)
- Route 53: $0.50 per hosted zone
- Certificate Manager: Free
- **Total**: $15-60/month for typical usage

This deployment architecture provides a scalable, performant, and cost-effective solution for hosting the React frontend while integrating seamlessly with the existing AWS GraphQL API infrastructure.