module.exports = {
  root: true,
  extends: ['airbnb-base', 'prettier'],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  plugins: ['prettier'],
  rules: {
    // allow reassigning param
    'no-param-reassign': [2, { props: false }],
    'prettier/prettier': 'warn',
    'linebreak-style': ['error', 'unix'],
    curly: ['error', 'all'],
    'import/extensions': [
      'error',
      {
        js: 'always',
      },
    ],
  },
};
