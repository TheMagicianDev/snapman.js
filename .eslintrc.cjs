const jsRules = {
  quotes: [
    'error',
    'single',
    { avoidEscape: true, allowTemplateLiterals: false },
  ],
  'import/no-cycle': 'warn',
  'class-methods-use-this': 'off',
  'import/prefer-default-export': 'off',
  'comma-dangle': 'off',
  'no-underscore-dangle': 'off',
  'no-prototype-builtins': 'off',
  'object-curly-newline': 'off',
  'operator-linebreak': 'off',
  'implicit-arrow-linebreak': 'off',
  'function-paren-newline': 'off',
  'import/no-extraneous-dependencies': 'off',
  'import/extensions': 'off',
  'import/no-absolute-path': 'off',
  'no-plusplus': 'off',
  'generator-star-spacing': 'off',
};

const tsRules = {
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/comma-dangle': 'off',
  '@typescript-eslint/naming-convention': 'off',
  '@typescript-eslint/indent': 'off',
  '@typescript-eslint/no-loop-func': 'off',
};

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:prettier/recommended', 'airbnb-base'],
  plugins: ['prettier'],
  rules: jsRules,
  overrides: [
    /**
     * Typescript files configuration
     */
    {
      files: ['**/*.{ts,mts,cts,tsx}'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'airbnb-base',
        'airbnb-typescript/base',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./.tsconfig.eslint.json'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
      rules: {
        ...jsRules,
        ...tsRules,
      },
      overrides: [
        {
          files: ['src/**/*.{ts,mts,cts,tsx}'],
          parserOptions: {
            project: ['./tsconfig.json'],
          },
          rules: {
            ...jsRules,
            ...tsRules,
          },
        },
      ],
    },
    /**
     * jest and tests configurations
     */
    {
      files: ['e2e-tests/**/*.ts'],
      parserOptions: {
        project: ['./e2e-tests.tsconfig.json'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    {
      files: ['e2e-tests/**/*.test.js'],
      env: {
        jest: true,
        jasmine: true,
      },
    },
  ],
};
