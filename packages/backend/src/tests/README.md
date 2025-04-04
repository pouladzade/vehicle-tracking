# Vehicle Tracking Backend Tests

This directory contains the test suite for the Vehicle Tracking backend application.

## Running Tests

You can run the tests using the following npm commands:

```bash
# Run all tests
yarn test

# Run tests with watch mode
yarn test:watch

# Run tests with coverage report
yarn test:coverage
```

## Test Structure

The tests are organized as follows:

- Unit tests for utilities and helper functions
- Mock tests for controllers and repositories
- Integration tests for API endpoints

## Testing Approach

We use the following approach for testing:

1. **Unit tests** for individual functions and classes
2. **Repository mocks** for testing controllers without database dependencies
3. **Supertest** for testing API endpoints

## Test Coverage Goals

Our test coverage goals are:

- **Utils**: 100% coverage
- **Repositories**: At least 90% coverage
- **Controllers**: At least 85% coverage
- **Routes**: At least 80% coverage
- **Overall**: At least 85% coverage

## Writing Tests

### Repository Tests

For repositories, create mock implementations that implement the repository interface. This allows for testing controllers without database dependencies.

Example:

```typescript
class MockCustomerRepository implements CustomerRepository {
  private customers: Customer[] = [];

  async findAll(): Promise<Customer[]> {
    return [...this.customers];
  }

  // Implement other methods...
}
```

### Controller Tests

Controllers should be tested with mock repositories, focusing on:

1. Successful operations
2. Error handling
3. Edge cases

Example:

```typescript
describe("CustomerController", () => {
  let mockRepo: MockCustomerRepository;

  beforeEach(() => {
    mockRepo = new MockCustomerRepository();
    RepositoryFactory.setCustomerRepository(mockRepo);
  });

  it("should return all customers", async () => {
    // Test implementation
  });
});
```

### Route Tests

Routes should be tested using Supertest, focusing on:

1. HTTP status codes
2. Response format
3. Authentication requirements

Example:

```typescript
describe("Customer Routes", () => {
  it("GET /api/customers should return all customers", async () => {
    const response = await request(app)
      .get("/api/customers")
      .set("x-customer-id", customerId.toString());

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

## Test First Approach

For new features, consider using a test-first approach:

1. Write the test for the new functionality
2. Run the test and watch it fail
3. Implement the functionality
4. Run the test again to confirm success

## Code Coverage Reports

After running `yarn test:coverage`, you can find the coverage report in the `coverage` directory. Open `coverage/lcov-report/index.html` in a browser to view the detailed report.
