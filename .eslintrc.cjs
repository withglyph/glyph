module.exports = {
  parser: '@typescript-eslint/parser',
  env: { browser: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:unicorn/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@unocss/recommended',
  ],
  plugins: ['simple-import-sort'],
  rules: {
    // eslint
    'consistent-return': 'warn',
    'curly': 'warn',
    'default-case-last': 'warn',
    'eqeqeq': 'error',
    'func-name-matching': 'error',
    'func-style': 'error',
    'no-lonely-if': 'warn',
    'no-multi-assign': 'error',
    'no-sequences': 'error',
    'no-unneeded-ternary': 'warn',
    'no-useless-rename': 'warn',
    'object-shorthand': ['warn', 'properties'],
    'operator-assignment': 'warn',
    'prefer-arrow-callback': 'warn',
    'prefer-object-spread': 'warn',
    'prefer-promise-reject-errors': 'error',
    'prefer-regex-literals': 'warn',
    'prefer-rest-params': 'error',
    'prefer-spread': 'warn',
    'prefer-template': 'warn',
    'spaced-comment': 'warn',

    // @typescript-eslint
    '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
    '@typescript-eslint/method-signature-style': 'warn',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-useless-empty-export': 'warn',
    '@typescript-eslint/prefer-enum-initializers': 'error',

    // unicorn
    'unicorn/custom-error-definition': 'error',
    'unicorn/no-nested-ternary': 'off',
    'unicorn/no-null': 'off',
    'unicorn/no-useless-undefined': 'off',
    'unicorn/prefer-at': 'warn',
    'unicorn/prefer-string-replace-all': 'warn',
    'unicorn/prevent-abbreviations': 'off',

    // import
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'import/first': 'warn',
    'import/newline-after-import': 'warn',
    'import/no-default-export': 'error',
    'import/no-empty-named-blocks': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-unresolved': 'off',
    'import/no-useless-path-segments': 'warn',

    // simple-import-sort
    'simple-import-sort/exports': 'warn',
    'simple-import-sort/imports': [
      'warn',
      {
        groups: [['^\\u0000', '^node:', '^@?\\w', '^', '^\\.', '^.*\\u0000$']],
      },
    ],

    // prettier
    'prettier/prettier': 'warn',
  },
  overrides: [
    {
      files: ['src/**/*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: { parser: '@typescript-eslint/parser' },
      extends: ['plugin:svelte/all', 'plugin:svelte/prettier'],
      rules: {
        'import/no-mutable-exports': 'off',
        'svelte/block-lang': ['error', { script: 'ts', style: 'scss' }],
        'svelte/valid-compile': 'off',
        'svelte/prefer-destructured-store-props': 'off',
        'svelte/experimental-require-slot-types': 'off',
        'svelte/experimental-require-strict-events': 'off',
        'svelte/@typescript-eslint/no-unnecessary-condition': 'off',
        'unicorn/filename-case': [
          'error',
          { cases: { kebabCase: true, pascalCase: true } },
        ],
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { varsIgnorePattern: '^\\$\\$(Props|Events|Slots)$' },
        ],
      },
    },
  ],
  settings: {
    'import/resolver': {
      node: {},
      typescript: {},
    },
  },
};
