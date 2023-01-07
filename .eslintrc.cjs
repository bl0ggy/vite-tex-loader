module.exports = {
  root: true,
  env: {
    "node": true,
  },
  parserOptions: {
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  reportUnusedDisableDirectives: true
}
