// Test setup file
// Mock global objects and setup test environment

// Mock window.ethereum for wallet tests
global.window = {
  ethereum: {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  }
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Setup test timeout
jest.setTimeout(30000);