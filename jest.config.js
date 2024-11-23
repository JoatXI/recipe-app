export default {
  testEnvironment: 'node',
  transform: {},
  transformIgnorePatterns: ['node_modules/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.mjs$': '$1'
  }
}