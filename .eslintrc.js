module.exports = {
  'env': {
    'browser': true,
    'es2021': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module'
  },
  'rules': {
    'no-unused-vars': 'warn',
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'no-unreachable': 'error',
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'error',
    'no-unused-private-class-members': 'error'
  }
};