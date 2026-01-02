# React TypeScript Development Patterns

## Error Handling and User Feedback Patterns

### Error Boundary Implementation
```typescript
// ✅ Correct - Enhanced Error Boundary with comprehensive error handling
import { EnhancedErrorBoundary } from '../components/layout/EnhancedErrorBoundary';

// Wrap components that might throw errors
<EnhancedErrorBoundary 
  level="component" 
  maxRetries={3}
  onError={(error, errorInfo) => logError(error, errorInfo)}
>
  <SomeComponent />
</EnhancedErrorBoundary>

// ❌ Incorrect - No error boundary protection
<SomeComponent /> // Can crash entire app if error occurs
```

### Loading States and Progress Indicators
```typescript
// ✅ Correct - Use LoadingSpinner for consistent loading states
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const MyComponent = () => {
  const [loading, setLoading] = useState(false);
  
  if (loading) {
    return <LoadingSpinner message="Loading restrooms..." size="medium" />;
  }
  
  return <div>Content</div>;
};

// ❌ Incorrect - Inconsistent loading indicators
const MyComponent = () => {
  if (loading) {
    return <div>Loading...</div>; // No accessibility, inconsistent styling
  }
};
```

### Retry Mechanisms
```typescript
// ✅ Correct - Use RetryButton for failed operations
import { RetryButton } from '../components/ui/RetryButton';

const handleRetry = async () => {
  try {
    await refetchData();
  } catch (error) {
    console.error('Retry failed:', error);
    throw error; // Let RetryButton handle retry logic
  }
};

<RetryButton 
  onRetry={handleRetry}
  maxRetries={3}
  variant="primary"
>
  Try Again
</RetryButton>

// ❌ Incorrect - Manual retry implementation without proper error handling
const [retryCount, setRetryCount] = useState(0);
const handleRetry = () => {
  setRetryCount(prev => prev + 1);
  // Manual retry logic - error prone
};
```

### Network Status Handling
```typescript
// ✅ Correct - Use NetworkStatusBanner for network status feedback
import { NetworkStatusBanner } from '../components/ui/NetworkStatusBanner';

const App = () => (
  <div>
    <NetworkStatusBanner 
      showRetryButton 
      onRetry={() => window.location.reload()}
    />
    <MainContent />
  </div>
);

// ✅ Correct - Use OfflineIndicator for inline status
import { OfflineIndicator } from '../components/ui/OfflineIndicator';

const SearchForm = () => (
  <form>
    <OfflineIndicator showWhenOnline={false} />
    <input type="text" placeholder="Search..." />
  </form>
);
```

### Error Message Patterns
```typescript
// ✅ Correct - User-friendly error messages with context
const getErrorMessage = (error: Error): string => {
  if (error.name === 'ChunkLoadError') {
    return 'Failed to load application resources. Please refresh the page.';
  }
  
  if (error.message.includes('Network Error')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  return 'Something went wrong. Please try again.';
};

// ❌ Incorrect - Technical error messages exposed to users
const errorMessage = error.message; // "TypeError: Cannot read property 'map' of undefined"
```

## Apollo Client Integration

### Correct Import Patterns
```typescript
// ✅ Correct - Use React-specific imports
import { useMutation, useQuery, useSubscription } from '@apollo/client/react';

// ❌ Incorrect - Main package doesn't export React hooks
import { useMutation } from '@apollo/client';
```

### Mutation Typing
```typescript
// ✅ Correct - Properly typed mutation
const [createRestroom] = useMutation<
  { createRestroom: Restroom }, 
  { input: CreateRestroomInput }
>(CREATE_RESTROOM);

// ❌ Incorrect - Untyped mutation
const [createRestroom] = useMutation(CREATE_RESTROOM);
```

## TypeScript Import Patterns

### Type-Only Imports
When `verbatimModuleSyntax` is enabled, use type-only imports for types:

```typescript
// ✅ Correct - Type-only import
import type { Restroom, CreateRestroomInput } from '../../types/generated';
import type { LocationCoordinates } from '../../services/location';

// ❌ Incorrect - Regular import for types
import { Restroom, CreateRestroomInput } from '../../types/generated';
```

### Mixed Imports
```typescript
// ✅ Correct - Separate value and type imports
import { CREATE_RESTROOM } from '../../types/generated';
import type { Restroom, CreateRestroomInput } from '../../types/generated';

// ✅ Alternative - Mixed import syntax
import { CREATE_RESTROOM, type Restroom, type CreateRestroomInput } from '../../types/generated';
```

## Test File Patterns

### React Import in Tests
```typescript
// ✅ Correct - Only import React if JSX is used without React 17+ transform
import { render, screen, waitFor } from '@testing-library/react';

// ❌ Incorrect - Unused React import
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
```

### Vitest Test Setup
```typescript
// ✅ Correct - Proper Vitest imports and setup
import { vi, describe, it, expect, beforeEach } from 'vitest';

// ❌ Incorrect - Missing test globals or unused imports
import { vi, describe, it, expect, beforeEach, waitFor } from 'vitest'; // waitFor unused
```

### Global Mocking in Tests
```typescript
// ✅ Correct - Proper global mocking
Object.defineProperty(globalThis, 'navigator', {
  value: { geolocation: mockGeolocation },
  writable: true
});

// ❌ Incorrect - Using 'global' instead of 'globalThis'
Object.defineProperty(global, 'navigator', { /* ... */ });
```

### Window Confirm Mocking
```typescript
// ✅ Correct - Mock window.confirm in test setup
vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));

// Clean up after tests
afterEach(() => {
  vi.unstubAllGlobals();
});
```

### Apollo Client Mocking
```typescript
// ✅ Correct - Mock the React-specific package
vi.mock('@apollo/client/react', async () => {
  const actual = await vi.importActual('@apollo/client/react');
  return {
    ...actual,
    useMutation: vi.fn(() => [mockMutate, { loading: false, error: null }])
  };
});

// ❌ Incorrect - Mock the main package
vi.mock('@apollo/client', /* ... */);
```

## Component Development

### Form Validation Patterns
```typescript
// ✅ Correct - Real-time validation with proper typing
const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
  switch (name) {
    case 'name':
      if (typeof value === 'string') {
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
      }
      break;
    // ... other cases
  }
  return undefined;
};
```

### Error Handling
```typescript
// ✅ Correct - Comprehensive error handling
try {
  const { data } = await createRestroom({ variables: { input } });
  // Handle success
} catch (error: any) {
  let errorMessage = 'Operation failed. Please try again.';
  
  if (error.networkError) {
    errorMessage = 'Network error. Please check your connection.';
  } else if (error.graphQLErrors?.length > 0) {
    errorMessage = error.graphQLErrors[0].message;
  }
  
  setErrors({ general: errorMessage });
}
```

### Debounced Functions
```typescript
// ✅ Correct - Properly typed debounced function
const debouncedSearch = useCallback(
  debounce(async (query: string) => {
    // Implementation
  }, 300),
  []
);

// ❌ Incorrect - Generic unknown parameters
const debouncedSearch = useCallback(
  debounce(async (...args: unknown[]) => {
    // TypeScript can't infer parameter types
  }, 300),
  []
);
```

### Async Hook Patterns
```typescript
// ✅ Correct - Proper async state management
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAsyncOperation = async () => {
  setLoading(true);
  setError(null);
  
  try {
    await someAsyncOperation();
  } catch (err: any) {
    setError(err.message || 'Operation failed');
  } finally {
    setLoading(false);
  }
};
```

## Common Pitfalls to Avoid

### 1. Apollo Client Imports
- Always use `@apollo/client/react` for React hooks
- Don't import hooks from the main `@apollo/client` package

### 2. TypeScript Configuration
- Respect `verbatimModuleSyntax` setting by using type-only imports
- Use proper generic typing for Apollo hooks

### 3. Test Setup
- Don't import React unnecessarily in test files
- Mock the correct Apollo Client packages
- Use proper TypeScript types in mocks
- Use `globalThis` instead of `global` for browser globals

### 4. Component Props
- Always define proper TypeScript interfaces for component props
- Use optional properties appropriately
- Provide default values for optional props

### 5. Form Handling
- Implement real-time validation for better UX
- Handle loading states properly
- Provide comprehensive error messages
- Consider data persistence for long forms

### 6. UI Component Integration
- Ensure Icon component names match the IconName type
- Use correct Button variant values ('primary', 'secondary', 'danger', 'ghost')
- Don't use unsupported variants like 'text'

### 7. Type Export Conflicts
- Avoid duplicate type exports across modules
- Use explicit re-exports to resolve ambiguity
- Organize types in separate files when needed

### 8. State Management
- Use specific context hooks instead of full UI context
- Handle offline states in all user interactions
- Implement proper error boundaries for state errors
- Don't bypass the storage service for localStorage operations

### 9. Cache Management
- Use cache sync service instead of manual Apollo cache operations
- Coordinate between Apollo cache and local storage
- Handle cache invalidation properly after mutations
- Consider offline scenarios in all cache operations

## UI Component Patterns

### Button Component Usage
```typescript
// ✅ Correct - Valid button variants
<Button variant="primary">Submit</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost">Clear</Button>

// ❌ Incorrect - Invalid variant
<Button variant="text">Click me</Button>
```

### Icon Component Usage
```typescript
// ✅ Correct - Use valid icon names from IconName type
<Icon name="wheelchair" />
<Icon name="unisex" />
<Icon name="baby" />

// ❌ Incorrect - String that doesn't match IconName
<Icon name={someStringVariable} /> // Ensure variable is typed as IconName
```

### Form Input Props
```typescript
// ✅ Correct - Don't add unsupported HTML props to custom components
<Button onClick={handleClick} disabled={loading}>
  Submit
</Button>

// ❌ Incorrect - Adding unsupported props
<Button title="tooltip" onClick={handleClick}> // title not supported
  Submit
</Button>
```

## Type Organization Patterns

### Avoiding Export Conflicts
```typescript
// ✅ Correct - Explicit re-exports to avoid conflicts
// types/index.ts
export { SearchFilters as GraphQLSearchFilters } from './graphql';
export { SearchFilters as UISearchFilters } from './search';

// ✅ Alternative - Separate type files
// types/graphql-types.ts
export interface SearchFilters { /* GraphQL version */ }

// types/ui-types.ts  
export interface SearchFilters { /* UI version */ }
```

### Service Type Imports
```typescript
// ✅ Correct - Import only what's needed
import type { LocationCoordinates, LocationAddress } from './location';
import { getCurrentLocation } from './location';

// ❌ Incorrect - Importing unused types
import type { LocationCoordinates, LocationAddress, LocationResult } from './location';
// LocationResult never used
```

## State Management Patterns

### UI Context Usage
```typescript
// ✅ Correct - Use specific hooks for focused state access
import { useLoading, useErrors, useNotifications } from '../contexts/UIContext';

const MyComponent = () => {
  const { loading, setLoading } = useLoading();
  const { errors, setError, clearErrors } = useErrors();
  const { addNotification } = useNotifications();

  // Component logic
};

// ❌ Incorrect - Using full UI context when only specific state is needed
import { useUI } from '../contexts/UIContext';

const MyComponent = () => {
  const { state, setLoading, setError } = useUI(); // Too broad
};
```

### Local Storage Integration
```typescript
// ✅ Correct - Use storage service with error handling
import { storageService } from '../services/storage';

const saveUserPreferences = (preferences: UIPreferences) => {
  const success = storageService.setUIPreferences(preferences);
  if (!success) {
    console.warn('Failed to save preferences - storage unavailable');
  }
};

// ❌ Incorrect - Direct localStorage usage without error handling
const saveUserPreferences = (preferences: UIPreferences) => {
  localStorage.setItem('preferences', JSON.stringify(preferences)); // Can throw
};
```

### Optimistic Updates Pattern
```typescript
// ✅ Correct - Proper optimistic update with rollback
import { useOptimisticUpdates } from '../hooks/useOptimisticUpdates';

const MyComponent = () => {
  const { submitFeedbackOptimistically } = useOptimisticUpdates();

  const handleFeedback = async (feedback: FeedbackInput) => {
    const result = await submitFeedbackOptimistically(restroomId, feedback);
    
    if (result.success) {
      // Handle success (notification already shown by hook)
    } else {
      // Handle error (error notification already shown by hook)
    }
  };
};

// ❌ Incorrect - Manual optimistic updates without proper error handling
const handleFeedback = async (feedback: FeedbackInput) => {
  // Update UI immediately
  setOptimisticState(newState);
  
  try {
    await submitFeedback(feedback);
  } catch (error) {
    // Forgot to revert optimistic state
    console.error(error);
  }
};
```

### Cache Synchronization
```typescript
// ✅ Correct - Use cache sync service for data management
import { cacheSyncService } from '../services/cacheSync';

const syncData = async () => {
  const result = await cacheSyncService.syncRestrooms({ forceRefresh: true });
  
  if (result.success) {
    console.log(`Synced ${result.syncedItems} items`);
  } else {
    console.error('Sync failed:', result.errors);
  }
};

// ❌ Incorrect - Manual cache management without proper coordination
const syncData = async () => {
  await apolloClient.refetchQueries(); // Doesn't coordinate with local storage
};
```

### Network Status Handling
```typescript
// ✅ Correct - Use network status from UI context
import { useNetworkStatus } from '../contexts/UIContext';

const MyComponent = () => {
  const { networkStatus } = useNetworkStatus();

  if (!networkStatus.isOnline) {
    return <OfflineIndicator />;
  }

  return <OnlineContent />;
};

// ❌ Incorrect - Direct navigator.onLine usage without context
const MyComponent = () => {
  const isOnline = navigator.onLine; // Doesn't update reactively
};
```

### Apollo Client Error Handling Patterns

#### Proper Error Link Implementation
```typescript
// ✅ Correct - Properly typed error handler with void return
import { onError } from '@apollo/client/link/error';

interface GraphQLError {
  message: string;
  locations?: unknown;
  path?: unknown;
}

interface NetworkError {
  message: string;
  statusCode?: number;
}

interface ErrorResponse {
  graphQLErrors?: GraphQLError[];
  networkError?: NetworkError;
}

const errorLink = onError((errorResponse): void => {
  const { graphQLErrors, networkError } = errorResponse as ErrorResponse;
  
  if (graphQLErrors) {
    graphQLErrors.forEach((error: GraphQLError) => {
      console.error(`GraphQL error: ${error.message}`);
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError.message}`);
    
    if (networkError.statusCode) {
      switch (networkError.statusCode) {
        case 401:
          console.error('Unauthorized: Check API key configuration');
          break;
        case 403:
          console.error('Forbidden: Insufficient permissions');
          break;
        default:
          console.error(`HTTP ${networkError.statusCode}: ${networkError.message}`);
      }
    }
  }
});

// ❌ Incorrect - Returning values from error handler
const errorLink = onError((errorResponse) => {
  // ... error handling
  return forward(operation); // Error: onError handlers must return void
});
```

#### Error Handler Type Requirements
- Apollo Client error handlers must return `void`
- Cannot return observables or retry operations directly from onError
- Use proper TypeScript interfaces for error response typing
- Avoid `any` types by creating specific interfaces

## Development Workflow

1. **Start with Types** - Define interfaces and types first
2. **Import Correctly** - Use type-only imports where required
3. **Use Context Appropriately** - Use specific hooks instead of full context
4. **Handle Offline States** - Always consider offline scenarios
5. **Test Early** - Write tests alongside component development
6. **Resolve All Warnings** - Fix warnings immediately, not just errors
7. **Validate Continuously** - Use TypeScript diagnostics to catch issues
8. **Handle Errors** - Implement comprehensive error handling
9. **Clean Test Output** - Ensure tests run without warnings or errors

### Quality Gates for Development

#### Before Committing Code
- [ ] All TypeScript errors resolved
- [ ] All test warnings resolved (especially `act()` warnings)
- [ ] No network errors in test output
- [ ] Clean console output during test runs
- [ ] All tests passing
- [ ] Code follows established patterns
- [ ] State management uses appropriate context hooks
- [ ] Offline scenarios are handled properly
- [ ] Cache synchronization is implemented where needed

#### Test Quality Checklist
- [ ] Tests use proper async patterns with `act()` when needed
- [ ] Apollo Client tests use test providers, not production clients
- [ ] No network requests in unit/component tests
- [ ] Proper mock cleanup between tests
- [ ] Tests are isolated and don't depend on external state
- [ ] Console output is clean (no warnings or errors)
- [ ] Storage service mocks are used for localStorage tests
- [ ] UI context tests verify state transitions properly

### Warning Resolution Strategy

**Immediate Action Required:**
- `act()` warnings - Indicate improper React state handling
- Network errors - Suggest missing test isolation
- TypeScript errors - Block compilation and deployment

**High Priority:**
- Console warnings - May indicate runtime issues
- Deprecation warnings - Future compatibility concerns
- Performance warnings - User experience impact

**Medium Priority:**
- Linting warnings - Code quality and consistency
- Accessibility warnings - User experience for all users

## Debugging TypeScript Issues

### Check Import Paths
```bash
# Verify what's exported from a package
node -e "console.log(Object.keys(require('@apollo/client/react')))"
```

### Use TypeScript Diagnostics
- Always run `getDiagnostics` after making changes
- Fix TypeScript errors before proceeding
- Don't ignore type warnings

### Test Incrementally
- Run tests after each significant change
- Use focused test runs during development
- Ensure all tests pass before considering task complete

### State Management Testing Patterns

#### UI Context Testing
```typescript
// ✅ Correct - Test UI context with proper providers
import { render, screen, act } from '@testing-library/react';
import { UIProvider, useUI } from '../contexts/UIContext';

const TestComponent = () => {
  const { state, setLoading, addNotification } = useUI();
  return (
    <div>
      <div data-testid="loading">{state.loading.search.toString()}</div>
      <button onClick={() => setLoading('search', true)}>Set Loading</button>
      <button onClick={() => addNotification({ type: 'success', message: 'Test' })}>
        Add Notification
      </button>
    </div>
  );
};

describe('UI Context', () => {
  it('should update loading state', async () => {
    await act(async () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );
    });

    const button = screen.getByText('Set Loading');
    await act(async () => {
      button.click();
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });
});
```

#### Storage Service Testing
```typescript
// ✅ Correct - Mock localStorage for storage tests
import { vi, beforeEach } from 'vitest';
import { storageService } from '../services/storage';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should handle storage operations', () => {
    localStorageMock.setItem.mockReturnValue(undefined);
    
    const result = storageService.setUserLocation({
      latitude: 40.7128,
      longitude: -74.0060,
    });

    expect(result).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });
});
```

#### Cache Sync Testing
```typescript
// ✅ Correct - Mock dependencies for cache sync tests
import { vi } from 'vitest';
import { cacheSyncService } from '../services/cacheSync';

vi.mock('../services/apollo', () => ({
  apolloClient: {
    cache: {
      extract: vi.fn(() => ({ 'Restroom:1': { id: '1', name: 'Test' } })),
    },
  },
  invalidateRestroomQueries: vi.fn(),
}));

vi.mock('../services/storage', () => ({
  storageService: {
    getOfflineRestrooms: vi.fn(() => []),
    setOfflineRestrooms: vi.fn(() => true),
  },
}));

describe('CacheSyncService', () => {
  it('should sync restrooms successfully', async () => {
    const result = await cacheSyncService.syncRestrooms({ forceRefresh: true });
    expect(result.success).toBe(true);
  });
});
```

## Test Configuration Patterns

### Resolving Test Warnings and Errors

**CRITICAL: Always resolve test warnings, not just errors**
- Test warnings indicate potential issues with test reliability and best practices
- `act()` warnings specifically indicate improper handling of React state updates
- Network errors in tests suggest missing mocks or improper test isolation
- Clean test output improves developer experience and catches real issues

### React Testing Library `act()` Patterns

#### Async Component Rendering
```typescript
// ✅ Correct - Proper async rendering with act()
import { render, screen, act, waitFor } from '@testing-library/react';

const renderWithProviders = async (component: React.ReactElement) => {
  let result: any;
  await act(async () => {
    result = render(
      <TestProviders>
        {component}
      </TestProviders>
    );
  });
  
  // Wait for any async operations to complete
  await waitFor(() => {
    // Just wait a tick for any immediate state updates
  });
  
  return result;
};

// Usage in tests
describe('Component', () => {
  it('renders correctly', async () => {
    await renderWithProviders(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

#### When `act()` Warnings Occur
- Components with `useEffect` hooks that trigger state updates on mount
- Async operations like geolocation, API calls, or debounced inputs
- Components that use timers, intervals, or other async side effects
- Any state update that happens after the initial render

#### Common `act()` Warning Scenarios
```typescript
// ❌ Problematic - Components with async effects
const ComponentWithAsyncEffects = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // This will trigger act() warnings in tests
    fetchData().then(setData);
  }, []);
  
  return <div>{data}</div>;
};

// ✅ Solution - Wrap render in act() and wait for updates
it('handles async effects', async () => {
  await act(async () => {
    render(<ComponentWithAsyncEffects />);
  });
  
  await waitFor(() => {
    expect(screen.getByText('Expected Data')).toBeInTheDocument();
  });
});
```

### Apollo Client Testing Patterns

#### Test-Specific Apollo Client Setup
```typescript
// ✅ Correct - Create mock Apollo Client for tests
// src/test/mocks/apollo.ts
import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';

// Create a no-op link that doesn't execute any operations
const noOpLink = new ApolloLink(() => {
  // Return a promise that never resolves (effectively ignoring all queries)
  return new Promise(() => {});
});

export const mockApolloClient = new ApolloClient({
  link: noOpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
      notifyOnNetworkStatusChange: false,
    },
    query: {
      errorPolicy: 'ignore',
    },
    mutate: {
      errorPolicy: 'ignore',
    },
  },
});
```

#### Test Provider Setup
```typescript
// ✅ Correct - Test-specific provider
// src/test/providers/TestApolloProvider.tsx
import React from 'react';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { mockApolloClient } from '../mocks/apollo';

export const TestApolloProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BaseApolloProvider client={mockApolloClient}>
      {children}
    </BaseApolloProvider>
  );
};
```

#### Avoiding Network Errors in Tests
```typescript
// ❌ Problematic - Using production Apollo Client in tests
import { ApolloProvider } from '../providers/ApolloProvider'; // Makes real network requests

// ✅ Correct - Using test Apollo Client
import { TestApolloProvider } from '../../test/providers/TestApolloProvider'; // No network requests

const renderWithApollo = async (component: React.ReactElement) => {
  await act(async () => {
    render(
      <TestApolloProvider>
        {component}
      </TestApolloProvider>
    );
  });
};
```

### Vitest Setup File
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.confirm globally
vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));

// Mock console methods to reduce test noise
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
```

### Test Quality Standards

#### Warning Resolution Priority
1. **Always resolve test warnings** - Warnings indicate potential reliability issues
2. **Fix `act()` warnings immediately** - They signal improper React state handling
3. **Eliminate network errors** - Tests should be isolated from external dependencies
4. **Address console errors/warnings** - Clean test output improves debugging

#### Test Isolation Best Practices
```typescript
// ✅ Correct - Isolated test setup
describe('Component Tests', () => {
  beforeEach(() => {
    // Reset all mocks and state before each test
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks();
  });
});
```

#### Mock Strategy for Different Test Types
```typescript
// ✅ Unit Tests - Mock external dependencies
vi.mock('../../services/api', () => ({
  fetchData: vi.fn().mockResolvedValue(mockData)
}));

// ✅ Integration Tests - Use test providers with controlled behavior
const renderWithTestProviders = (component) => {
  return render(
    <TestApolloProvider>
      <TestLocationProvider>
        {component}
      </TestLocationProvider>
    </TestApolloProvider>
  );
};

// ✅ Component Tests - Focus on user interactions and rendering
it('handles user input correctly', async () => {
  const user = userEvent.setup();
  render(<SearchForm onSubmit={mockSubmit} />);
  
  await user.type(screen.getByLabelText('Search'), 'test query');
  await user.click(screen.getByRole('button', { name: 'Search' }));
  
  expect(mockSubmit).toHaveBeenCalledWith('test query');
});
```

### Test File Organization
```typescript
// ✅ Correct - Organized test structure
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with required props', () => {
      // Test implementation
    });
  });

  describe('user interactions', () => {
    it('handles click events', async () => {
      // Test implementation
    });
  });

  describe('form validation', () => {
    it('validates required fields', async () => {
      // Test implementation
    });
  });
});
```

### Debugging Test Issues

#### Common Test Warning Patterns and Solutions

**`act()` Warnings**
```bash
# Warning message:
# "An update to ComponentName inside a test was not wrapped in act(...)"

# Root causes:
# - useEffect hooks triggering state updates
# - Async operations (timers, promises, network requests)
# - Event handlers that update state

# Solution: Wrap renders and interactions in act()
await act(async () => {
  render(<Component />);
});
```

**Network Errors in Tests**
```bash
# Error message:
# "Error: getaddrinfo ENOTFOUND mock-endpoint.com"

# Root cause: Tests using production Apollo Client or real network requests
# Solution: Use test-specific providers with mock clients
```

**Console Warnings/Errors**
```bash
# Warning message:
# "Warning: React does not recognize the `customProp` prop on a DOM element"

# Root cause: Passing non-standard props to DOM elements
# Solution: Filter props or use proper component interfaces
```

#### Test Debugging Workflow
1. **Identify the warning type** - `act()`, network, console, etc.
2. **Locate the source component** - Check which component triggers the warning
3. **Understand the async operation** - Find what's causing state updates
4. **Apply appropriate solution** - Use `act()`, mocks, or proper cleanup
5. **Verify the fix** - Run tests to ensure warnings are resolved
6. **Test in isolation** - Run specific test files to confirm the fix

#### Test Performance Optimization
```typescript
// ✅ Correct - Efficient test setup
describe('Component Suite', () => {
  // Use beforeAll for expensive setup that doesn't change
  beforeAll(async () => {
    await setupTestDatabase();
  });

  // Use beforeEach for test-specific setup
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Group related tests to share setup
  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockAuthState({ isAuthenticated: true });
    });

    it('shows user dashboard', () => {
      // Test implementation
    });
  });
});
```

### Mock Cleanup
```typescript
// ✅ Correct - Proper cleanup in tests
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  localStorage.clear();
});
```

## Performance Patterns

### Avoiding Unnecessary Re-renders
```typescript
// ✅ Correct - Memoized callbacks
const handleSubmit = useCallback(async (data: FormData) => {
  // Implementation
}, [dependency1, dependency2]);

// ✅ Correct - Memoized values
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(props.data);
}, [props.data]);
```

### Debouncing User Input
```typescript
// ✅ Correct - Debounced search with proper typing
const [searchTerm, setSearchTerm] = useState('');
const [debouncedTerm, setDebouncedTerm] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedTerm(searchTerm);
  }, 300);

  return () => clearTimeout(timer);
}, [searchTerm]);
```

## Error Handling Component Testing Patterns

### Error Boundary Testing
```typescript
// ✅ Correct - Test error boundaries with proper error simulation
import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('EnhancedErrorBoundary', () => {
  beforeEach(() => {
    // Mock console.error to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('catches and displays errors gracefully', async () => {
    await act(async () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );
    });

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });
});
```

### Loading Spinner Testing
```typescript
// ✅ Correct - Test loading states with proper accessibility
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner message="Loading restrooms..." />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
    expect(screen.getByText('Loading restrooms...')).toBeInTheDocument();
  });

  it('supports overlay mode', () => {
    render(<LoadingSpinner overlay />);
    
    expect(screen.getByRole('status')).toHaveClass(styles.overlay);
  });
});
```

### Network Status Component Testing
```typescript
// ✅ Correct - Mock UIContext for network status components
const mockNetworkStatus = {
  isOnline: false,
  lastOnline: null,
};

vi.mock('../../contexts/UIContext', () => ({
  useNetworkStatus: () => ({ networkStatus: mockNetworkStatus }),
  useNotifications: () => ({ addNotification: vi.fn() }),
}));

describe('NetworkStatusBanner', () => {
  it('shows offline message when disconnected', () => {
    render(<NetworkStatusBanner />);
    
    expect(screen.getByText(/currently offline/)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });
});
```

### Retry Button Testing
```typescript
// ✅ Correct - Test retry mechanisms with proper async handling
describe('RetryButton', () => {
  it('handles failed retries and shows error messages', async () => {
    const failingRetry = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<RetryButton onRetry={failingRetry} />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      button.click();
    });

    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('Retry (1/3)')).toBeInTheDocument();
  });

  it('disables button when max retries reached', async () => {
    const failingRetry = vi.fn().mockRejectedValue(new Error('Test error'));
    render(<RetryButton onRetry={failingRetry} maxRetries={1} />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      button.click();
    });

    expect(button).toBeDisabled();
    expect(screen.getByText('Max retries reached')).toBeInTheDocument();
  });
});
```

## Component Integration Patterns

### Error Boundary Placement
```typescript
// ✅ Correct - Strategic error boundary placement
const App = () => (
  <EnhancedErrorBoundary level="critical" maxRetries={3}>
    <Router>
      <Routes>
        <Route path="/search" element={
          <EnhancedErrorBoundary level="page">
            <SearchPage />
          </EnhancedErrorBoundary>
        } />
        <Route path="/restroom/:id" element={
          <EnhancedErrorBoundary level="component">
            <RestroomDetail />
          </EnhancedErrorBoundary>
        } />
      </Routes>
    </Router>
  </EnhancedErrorBoundary>
);

// ❌ Incorrect - No error boundaries or only at root level
const App = () => (
  <Router>
    <Routes>
      <Route path="/search" element={<SearchPage />} />
      <Route path="/restroom/:id" element={<RestroomDetail />} />
    </Routes>
  </Router>
);
```

### Loading State Integration
```typescript
// ✅ Correct - Consistent loading states throughout app
const SearchResults = () => {
  const { loading, error, data } = useQuery(SEARCH_RESTROOMS);

  if (loading) {
    return <LoadingSpinner message="Searching for restrooms..." />;
  }

  if (error) {
    return (
      <EnhancedErrorBoundary level="component">
        <div>Error occurred</div>
      </EnhancedErrorBoundary>
    );
  }

  return <RestroomList restrooms={data.restrooms} />;
};
```

## Development Workflow Best Practices

### Task Completion Checklist
- [ ] All TypeScript errors resolved
- [ ] All test warnings resolved (especially `act()` warnings)
- [ ] Clean console output during test runs
- [ ] All tests passing
- [ ] Code follows established patterns
- [ ] Error boundaries implemented where appropriate
- [ ] Loading states implemented for async operations
- [ ] Network status handling implemented
- [ ] Accessibility attributes added
- [ ] **Update steering instructions with new patterns learned**

### Quality Gates for Development

#### Before Committing Code
- [ ] All TypeScript errors resolved
- [ ] All test warnings resolved (especially `act()` warnings)
- [ ] No network errors in test output
- [ ] Clean console output during test runs
- [ ] All tests passing
- [ ] Code follows established patterns
- [ ] Error handling components used appropriately
- [ ] Loading states implemented consistently
- [ ] Network status components integrated where needed
- [ ] **Steering instructions updated with new patterns**

## Important Reminder

**ALWAYS UPDATE STEERING INSTRUCTIONS**: At the end of every task implementation, update the steering instructions in `.kiro/steering/` to include:
- New patterns discovered or implemented
- Common pitfalls encountered and their solutions
- Best practices learned during development
- Component usage patterns and integration guidelines
- Testing patterns for new functionality
- Any architectural decisions or conventions established

This ensures that future development maintains consistency and leverages lessons learned from previous implementations.