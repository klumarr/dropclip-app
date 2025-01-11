# DropClip Development & Testing Guide

WHY WE HAVE THESE CHECKS:

- We want to ensure that the code is of high quality and that it is easy to understand and maintain.
- We want to ensure that the code is secure and that it is easy to understand and maintain.
- We want to ensure that the code is easy to understand and maintain.

Let me break down each of these tools and their roles in the development process:

1. tsc --noEmit:

   - What it does:
     Runs TypeScript's type checker without generating JavaScript output files
     Performs full type checking across your entire codebase
     Validates all type definitions, interfaces, and type assertions

   - Benefits:
     Catches type-related errors early
     Ensures type safety across your application
     Validates imports/exports are type-safe
     Checks generic constraints

   - If turned off:
     Type errors won't be caught until runtime
     You might ship code with type mismatches
     You lose TypeScript's static analysis benefits
     IDE type checking might become less reliable

2. npm build (Production Build):

   - What it checks:
     Syntax errors
     Import/export errors
     React component validation
     Environment variable usage
     Asset references
     Tree-shaking validation

   - Benefits:
     Ensures code can be bundled correctly
     Validates all code paths are reachable
     Checks for missing dependencies
     Verifies build optimization can work

   - If turned off:
     Risk of shipping unbuildable code
     Might miss critical bundling issues
     Could have broken production deployments
     Performance optimizations might be missed

3. Pre-commit Linting:

   - What it checks:
     Code style consistency
     Common programming mistakes
     Unused imports/variables
     React best practices
     AWS SDK usage patterns

   - Benefits:
     Maintains code quality standards
     Catches common mistakes early
     Ensures consistent coding style
     Prevents bad patterns from being committed

   - If turned off:
     Code style inconsistencies
     Technical debt accumulation
     More time spent in code reviews
     Potential introduction of bad patterns

Development Priority Recommendations:
If you want to prioritize rapid development, here's what I recommend:

1. Keep During Development:
   - Basic TypeScript checking in IDE (real-time feedback)
   - Critical runtime error linting (from our current ESLint config)
   - Build process (to catch critical errors)
2. Can Disable During Development:
   - tsc --noEmit (run it before commits instead)
   - Style-related linting rules
   - Pre-commit hooks (run checks manually before committing)
3. Must Keep for Production:
   - Full TypeScript checking
   - Production build process
   - Critical error linting

Here's how to modify your setup for faster development:

## Quick Development Commands

### Fast Development Mode

```bash
# Start dev server without type checking
npm run dev:fast

# Build without type checking
npm run build:fast

# Run only critical lint checks
npm run lint:critical

# Run faster TypeScript checks
npm run typecheck:dev
```

### Skip Git Hooks

```bash
# Skip pre-commit hooks
git commit -m "your message" --no-verify
# OR
git commit -m "your message" -n
```

## Type Checking (`tsc --noEmit`)

### What it checks:

- Full TypeScript type validation
- Interface compliance
- Type definitions
- Import/export types
- Generic constraints

### How to disable temporarily:

```typescript
// Disable for next line
// @ts-ignore
const data = someFunction();

// Disable for whole file
// @ts-nocheck
// Enable again
// @ts-check
```

## Build Process (npm build)

### What it checks:

- Syntax errors
- Import/export validation
- React component validation
- Environment variables
- Asset references
- Tree-shaking

### Development Configuration

```json
// tsconfig.dev.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "skipLibCheck": true,
    "incremental": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "allowJs": true
  }
}
```

## ESLint Configuration

### Critical-only Checks (.eslintrc.critical.js)

```javascript
module.exports = {
  // ... base config ...
  rules: {
    // Critical TypeScript errors
    "@typescript-eslint/ban-types": "error",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-this-alias": "error",

    // Critical React rules
    "react-hooks/rules-of-hooks": "error",

    // Critical runtime errors
    "no-debugger": "error",
    "no-dupe-args": "error",
    "no-dupe-keys": "error",
    "no-duplicate-case": "error",
    "no-empty-pattern": "error",
    "no-ex-assign": "error",
    "no-func-assign": "error",
    "no-obj-calls": "error",
    "no-unreachable": "error",
    "use-isnan": "error",

    // Disabled non-critical rules
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    // ... more disabled rules ...
  },
};
```

### Disable ESLint Rules

```typescript
/* eslint-disable */
// Disable all rules for file

/* eslint-disable @typescript-eslint/no-explicit-any */
// Disable specific rule for file

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Disable for single line
```

## Pre-commit Hooks

### Current Configuration (.husky/pre-commit)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Only run critical lint checks
npm run lint:critical

# Run development TypeScript check
npm run typecheck:dev
```

## NPM Scripts Available

```json
{
  "scripts": {
    "dev": "vite", // Normal development
    "dev:fast": "SKIP_TYPE_CHECK=true vite", // Fast development
    "build": "tsc && vite build", // Production build
    "build:fast": "SKIP_TYPE_CHECK=true vite build", // Fast build
    "lint": "eslint src --ext ts,tsx", // Full lint
    "lint:critical": "eslint src --config .eslintrc.critical.js", // Critical lint
    "typecheck:dev": "tsc --project tsconfig.dev.json" // Dev type check
  }
}
```

## Development Best Practices

1.  **During Active Development**:

    - Use `npm run dev:fast` for rapid iteration
    - Disable specific TypeScript/ESLint rules as needed
    - Use `// @ts-ignore` sparingly for known issues

2.  **Before Committing**:

    - Run `npm run lint:critical` to catch critical issues
      # For your React/TypeScript files (excluding Lambda)
           `npm run lint:critica`
      # For your Lambda functions
           `npm run lint:lambda`
    - Run `npm run typecheck:dev` for type validation
    - Fix any critical errors before commit

3.  **Before Production Build**:

    - Run full `npm run lint`
    - Run full TypeScript check
    - Run complete `npm run build`

4.  **When to Skip Checks**:
    - During rapid prototyping
    - When working on experimental features
    - When dealing with known type issues
    - During dependency updates

## Warning

Disabling checks should be temporary during development. Always ensure all checks pass before:

- Merging to main branches
- Creating pull requests
- Deploying to production
- Sharing code with team members

Remember: These tools exist to prevent bugs and maintain code quality. Use the fast development mode responsibly!
