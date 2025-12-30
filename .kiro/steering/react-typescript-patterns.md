# React TypeScript Development Patterns

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

## Development Workflow

1. **Start with Types** - Define interfaces and types first
2. **Import Correctly** - Use type-only imports where required
3. **Test Early** - Write tests alongside component development
4. **Validate Continuously** - Use TypeScript diagnostics to catch issues
5. **Handle Errors** - Implement comprehensive error handling

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

## Test Configuration Patterns

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