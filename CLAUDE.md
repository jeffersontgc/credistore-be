# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS backend application for Credistore. The project uses Yarn as the package manager and follows NestJS conventions for a TypeScript-based Node.js server application.

## Development Commands

### Package Management
```bash
yarn install                 # Install dependencies
```

### Running the Application
```bash
yarn start                   # Start in production mode
yarn start:dev              # Start in watch mode (development)
yarn start:debug            # Start with debugging enabled
```

### Building
```bash
yarn build                   # Compile TypeScript to JavaScript (output to dist/)
```

### Code Quality
```bash
yarn lint                    # Run ESLint with auto-fix
yarn format                  # Format code with Prettier
```

### Testing
```bash
yarn test                    # Run unit tests
yarn test:watch             # Run tests in watch mode
yarn test:cov               # Run tests with coverage report
yarn test:e2e               # Run end-to-end tests
yarn test:debug             # Run tests with Node debugger
```

## Architecture

### Application Structure

- **src/main.ts**: Application entry point. Bootstraps the NestJS app and listens on port 3000 (or PORT env variable).
- **src/app.module.ts**: Root application module that imports all feature modules.
- **src/app.controller.ts & src/app.service.ts**: Basic root-level controller and service (boilerplate).

### TypeScript Configuration

- Uses `nodenext` module resolution
- Targets ES2023
- Decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`)
- `noImplicitAny` is set to false for flexibility

### Code Style

- **ESLint**: Uses TypeScript ESLint with recommended type-checked rules
- **Prettier**: Single quotes, trailing commas, auto end-of-line
- Specific ESLint overrides:
  - `@typescript-eslint/no-explicit-any`: off
  - `@typescript-eslint/no-floating-promises`: warn
  - `@typescript-eslint/no-unsafe-argument`: warn

### Testing Setup

- **Unit tests**: Jest configuration in package.json, test files use `*.spec.ts` pattern
- **E2E tests**: Separate Jest config in `test/jest-e2e.json`
- Test root directory is `src/` for unit tests

## NestJS Conventions

Follow standard NestJS patterns:
- Use decorators for dependency injection (`@Injectable()`, `@Module()`, etc.)
- Controllers handle HTTP routing (`@Controller()`, `@Get()`, `@Post()`, etc.)
- Services contain business logic
- Modules organize related functionality
