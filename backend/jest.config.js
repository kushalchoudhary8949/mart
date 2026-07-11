module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverageFrom: [
    'src/services/auth.service.ts',
    'src/middlewares/auth.ts',
    'src/utils/jwt.ts',
    'src/utils/AppError.ts',
    'src/utils/constants.ts',
    'src/middlewares/validate.ts',
    'src/validators/auth.validator.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
