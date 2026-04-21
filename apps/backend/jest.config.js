/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/tests/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^ioredis$": "<rootDir>/__mocks__/ioredis.js",
    "^uuid$": "<rootDir>/__mocks__/uuid.js",
  },
  setupFiles: ["<rootDir>/tests/setup.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tests/tsconfig.json" }],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!uuid/)"
  ],
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts",
    "!src/server.ts",
    "!src/worker.ts",
  ],
};
