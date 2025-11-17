const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Путь к Next.js приложению для загрузки next.config.js и .env файлов
  dir: "./",
});

// Добавьте любую пользовательскую конфигурацию Jest ниже
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/__mocks__/**",
  ],
};

// createJestConfig экспортируется таким образом, чтобы next/jest мог загрузить конфигурацию Next.js, которая асинхронна
module.exports = createJestConfig(customJestConfig);

