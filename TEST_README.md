# Testing Guide

This project uses Vitest for testing with comprehensive test coverage for both utility functions and Svelte components.

## Test Setup

- **Test Framework**: Vitest
- **Component Testing**: @testing-library/svelte
- **DOM Environment**: jsdom
- **Test Location**: Tests are co-located with source files using `.test.ts` extension

## Running Tests

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Unit Tests

**`src/lib/c2pa.test.ts`**
- Tests for C2PA SDK utilities
- Validates file processing with trust lists
- Tests certificate handling

**`src/lib/trustListTest.test.ts`**
- Tests for trust list fetching functionality
- Validates HTTP responses and error handling
- Tests logging output

### Component Tests

**`src/lib/FileUpload.test.ts`**
- Tests for FileUpload component in both compact and full modes
- Validates drag-and-drop functionality
- Tests file selection events
- Tests keyboard accessibility

**`src/lib/CertificateManager.test.ts`**
- Tests for CertificateManager component
- Validates certificate upload and validation
- Tests certificate removal functionality
- Tests file type restrictions

## Test Coverage

Current test suite includes:
- 33 test cases
- Unit tests for core utilities
- Component interaction tests
- Error handling tests
- Accessibility tests

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction()
    expect(result).toBe(expected)
  })
})
```

### Component Test Example

```typescript
import { render, fireEvent } from '@testing-library/svelte'
import MyComponent from './MyComponent.svelte'

it('should handle click', async () => {
  const { getByText } = render(MyComponent)
  const button = getByText('Click me')
  await fireEvent.click(button)
  expect(button).toBeInTheDocument()
})
```

## Mocking

- Fetch API is mocked globally in `src/test/setup.ts`
- Component tests use @testing-library utilities for DOM interaction
- C2PA SDK is mocked in unit tests to avoid WASM dependencies

## Continuous Integration

Tests are designed to run in CI environments:
- No external dependencies required
- All network calls are mocked
- Tests run in isolated jsdom environment
- Deterministic test execution

## Debugging Tests

```bash
# Run specific test file
npm test -- src/lib/c2pa.test.ts

# Run tests matching pattern
npm test -- -t "should process file"

# Run with verbose output
npm test -- --reporter=verbose
```

## Coverage Goals

Target coverage metrics:
- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

Run `npm run test:coverage` to see current coverage report.
