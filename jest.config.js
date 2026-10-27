module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/*.test.{ts,tsx}"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { useESM: false }],
  },
  collectCoverageFrom: [
    "lib/experiments/**/*.{ts,tsx}",
    "!**/*.test.{ts,tsx}",
  ],
};