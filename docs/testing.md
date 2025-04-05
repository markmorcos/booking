# Testing and Documentation Guide

This document outlines how to run tests and generate documentation for the Fr. Youhanna Makin appointment booking application.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Running Backend Tests](#running-backend-tests)
3. [Running Frontend Tests](#running-frontend-tests)
4. [Continuous Integration](#continuous-integration)
5. [Generating Documentation](#generating-documentation)
6. [Test Coverage](#test-coverage)

## Testing Overview

The application uses several testing frameworks:

- **RSpec**: For Ruby/Rails backend testing
- **Jest**: For JavaScript/TypeScript frontend testing
- **RuboCop**: For Ruby code linting
- **ESLint**: For JavaScript/TypeScript code linting

## Running Backend Tests

### Running RSpec Tests

```bash
# Run all RSpec tests
bundle exec rspec

# Run specific tests
bundle exec rspec spec/models/admin_user_spec.rb
bundle exec rspec spec/controllers/appointments_controller_spec.rb

# Run with specific format
bundle exec rspec --format documentation

# Run with specific seed
bundle exec rspec --seed 1234
```

### Running RuboCop Linting

```bash
# Run RuboCop on all files
bundle exec rubocop

# Run RuboCop with autocorrect
bundle exec rubocop -a

# Run RuboCop on specific files
bundle exec rubocop app/models app/controllers
```

## Running Frontend Tests

### Running Jest Tests

```bash
# Run all Jest tests
yarn test

# Run specific tests
yarn test app/frontend/__tests__/components/BookingForm.test.tsx

# Run tests with coverage report
yarn test --coverage

# Run tests in watch mode
yarn test --watch
```

### Running ESLint

```bash
# Run ESLint on all files
yarn lint

# Run ESLint with fix option
yarn lint --fix

# Run ESLint on specific files
yarn lint app/frontend/components/
```

## Continuous Integration

Tests run automatically on GitHub Actions for:

- Every pull request to `main`
- Every push to `main`
- Every tag push with format `v*`

The CI pipeline includes:

1. Setting up Ruby, Node.js, and PostgreSQL
2. Installing dependencies
3. Running RSpec tests
4. Running Jest tests
5. Running RuboCop and ESLint

Failed tests will prevent the application from being deployed.

## Generating Documentation

### API Documentation with YARD

YARD is used to generate Ruby API documentation:

```bash
# Install YARD
gem install yard

# Generate documentation
bundle exec yard doc app lib

# View documentation (serve locally)
bundle exec yard server
```

The documentation will be available at [http://localhost:8808](http://localhost:8808).

### Frontend Documentation with TypeDoc

TypeDoc is used to generate TypeScript documentation:

```bash
# Install TypeDoc
npm install -g typedoc

# Generate documentation
typedoc --out docs/frontend app/frontend

# View documentation
open docs/frontend/index.html
```

### Automated Documentation

The CI/CD pipeline automatically generates documentation on pushes to `main` and makes it available as an artifact. If configured, it can also be published to GitHub Pages.

## Test Coverage

### Backend Coverage with SimpleCov

```bash
# Run tests with coverage
COVERAGE=true bundle exec rspec
```

The coverage report will be generated in the `coverage` directory.

### Frontend Coverage with Jest

```bash
# Run tests with coverage
yarn test --coverage
```

The coverage report will be generated in the `coverage` directory.

## Best Practices

1. Write tests before writing code (TDD)
2. Aim for at least 80% test coverage
3. Test edge cases and error conditions
4. Document all public methods and classes
5. Keep tests fast and independent
6. Run the full test suite before pushing changes
