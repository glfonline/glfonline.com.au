# Testing Setup

This project uses **Vitest** for unit tests and **Vitest Browser Mode** for component tests, using **co-located tests** for better developer experience.

## Testing Strategy

### Unit Tests (Node Environment)

- **Location**: Co-located with source files
- **Naming**: `*.unit.test.ts` (same directory as source)
- **Environment**: Node.js
- **Use Cases**: Utility functions, business logic, data transformations
- **Example**: `app/lib/sort-sizes.unit.test.ts`

### Component Tests (Browser Environment)

- **Location**: Co-located with source files
- **Naming**: `*.browser.test.tsx` (same directory as source)
- **Environment**: Real browser (Chromium via Playwright)
- **Use Cases**: React components, user interactions, form validation
- **Example**: `app/components/design-system/button/button.browser.test.tsx`

### E2E Tests (Playwright)

- **Location**: `packages/playwright/e2e/`
- **Environment**: Real browser via Playwright
- **Use Cases**: Full user journeys, integration tests
- **Example**: `packages/playwright/e2e/seo-meta-tags.spec.ts`

## Running Tests

### Root Commands (CI/CD Ready)

```bash
# Run unit tests
pnpm test:unit

# Run browser tests
pnpm test:browser

# Run E2E tests
pnpm test:e2e
```

### App-Specific Commands

```bash
# Run all tests (unit + browser)
pnpm test:all

# Run all tests in watch mode
pnpm test:all --watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run specific test types
pnpm test:unit       # Unit tests only
pnpm test:browser    # Browser tests only
```

## Test File Naming Convention

- **Unit tests**: `*.unit.test.ts` (co-located with source)
- **Component tests**: `*.browser.test.tsx` (co-located with source)
- **E2E tests**: `packages/playwright/e2e/*.spec.ts`
- **No setup files needed** - Using real browser APIs

## Test Configuration

### Why Two Config Files?

Vitest requires separate configuration files for different test environments because:

1. **Environment Separation**: Node.js and browser environments have fundamentally different APIs and globals
2. **File Patterns**: Unit tests and browser tests use different file naming conventions
3. **Performance**: Running all tests in browser mode would be slower and unnecessary
4. **Real Browser Testing**: Browser tests use actual browser APIs via Playwright, not mocks

### Vitest Configs

- `vitest.unit.config.ts` - Unit tests (Node environment)
  - Includes: `app/**/*.unit.test.ts`
  - Environment: Node.js

- `vitest.browser.config.ts` - Browser tests (Playwright environment)
  - Includes: `app/**/*.browser.test.tsx`
  - Environment: Real browser (Chromium via Playwright)

### Turbo Configuration

- Root `turbo.json` includes test tasks for CI/CD
- Tests run in parallel across packages
- Caching enabled for faster subsequent runs

## Component Testing with Browser Mode

Browser Mode allows testing React components in a real browser environment:

```tsx
import { render } from 'vitest-browser-react';
import { Button } from './button';

describe('Button Component', () => {
  it('should handle click events', async () => {
    let clickCount = 0;
    const handleClick = () => {
      clickCount++;
    };

    const screen = render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    await button.click();

    expect(clickCount).toBe(1);
  });

  it('should be accessible', () => {
    const screen = render(<Button>Accessible Button</Button>);

    const button = screen.getByRole('button', { name: 'Accessible Button' });
    expect(button).toBeDefined();
  });
});
```

## Form Testing

Forms should be tested using Remix's `fetcher.Form` and TanStack Form SSR patterns:

```tsx
import { render } from 'vitest-browser-react';
import { ContactForm } from './form';

describe('ContactForm', () => {
  it('should validate required fields', async () => {
    const screen = render(<ContactForm />);

    const submitButton = screen.getByRole('button');
    await submitButton.click();

    await expect.element(screen.getByText(/name is required/i)).toBeInTheDocument();
  });
});
```

## Mocking

### Unit Tests

- Use `vi.mock()` for module mocking
- Mock external services and APIs
- Mock Remix-specific functions

### Component Tests

- Mock action functions
- Mock external dependencies
- Use real browser interactions

## Best Practices

1. **Test behavior, not implementation**
   - Focus on user interactions and outcomes
   - Avoid testing CSS classes or internal DOM structure
   - Test accessibility and screen reader support

2. **Use descriptive test names**
   - `it('should handle click events', ...)`
   - `it('should be accessible via screen readers', ...)`

3. **Follow AAA pattern**: Arrange, Act, Assert
   - Arrange: Set up test data and components
   - Act: Perform user interactions
   - Assert: Verify expected outcomes

4. **Keep tests isolated and independent**
   - Each test should be self-contained
   - Avoid shared state between tests

5. **Use semantic queries over data-testid**
   - Prefer `getByRole('button', { name: 'Click me' })`
   - Use `getByText()`, `getByLabelText()` for accessibility

6. **Test accessibility with screen readers in mind**
   - Verify proper ARIA attributes
   - Test loading state announcements
   - Ensure keyboard navigation works

## Configuration

The testing setup is configured in:

- `vitest.unit.config.ts` - Unit tests (Node environment)
- `vitest.browser.config.ts` - Browser tests (Playwright environment)

**Note**: No setup files are needed since we use real browser APIs and our tests don't require complex mocking.

### Environment Variables

- `ENCRYPTION_KEY` - Required for session storage in Remix app
- `SENTRY_AUTH_TOKEN` - Optional for source map uploads

## Dependencies

### Core Testing

- `vitest` - Test runner
- `@vitest/browser` - Browser Mode support
- `@vitest/ui` - Test UI
- `playwright` - Browser automation
- `vitest-browser-react` - React component testing

### Removed Dependencies

- `jsdom` - No longer used (replaced with real browser)
- `@testing-library/*` - No longer used (using Vitest Browser Mode)
- `vitest-browser-react@^2.1.5` - Downgraded to `^1.0.1` for compatibility

## Current Test Status

### ✅ Working Tests

- **Unit Tests**: `app/lib/sort-sizes.unit.test.ts` (9 tests passing)
- **Browser Tests**: `app/components/design-system/button/button.browser.test.tsx` (5 tests passing)
- **E2E Tests**: Playwright tests for SEO, robots.txt, and cache headers

### ✅ CI/CD Ready

- Root package.json has test scripts for CI
- Turbo configuration supports parallel test execution
- Tests run in non-watch mode for CI environments
- Headless browser testing enabled

### ✅ Configuration Verified

- Vitest Browser Mode working with Playwright
- Real browser environment for component testing
- Proper separation of unit and browser test environments
- No browser API mocks (using real browser)

## Benefits of Co-located Tests

1. **🔍 Easy Discovery**: Tests are right next to the code they test
2. **📝 Better Context**: Developers can see tests and implementation together
3. **🚀 Faster Development**: No need to navigate between separate test directories
4. **🔄 Easier Refactoring**: When you move code, tests move with it
5. **📦 Clear Ownership**: Each component/function owns its tests
6. **⚡ Import Simplicity**: Relative imports are straightforward
