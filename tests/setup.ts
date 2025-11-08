/// <reference types="jest" />
process.env.JWT_SECRET = "test-secret";

beforeEach(() => {
  jest.clearAllMocks();
});
