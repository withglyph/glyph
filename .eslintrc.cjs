module.exports = {
  parser: '@typescript-eslint/parser',
  env: { browser: true, serviceworker: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:unicorn/recommended',
    'plugin:import/recommended',
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
    'spaced-comment': ['warn', 'always', { markers: ['/'] }],

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
      files: [
        'src/{hooks,lib,routes,vite}/**/*.ts',
        'tests/**/*.ts',
        'src/**/*.svelte',
      ],
      parserOptions: {
        project: './tsconfig.json',
        extraFileExtensions: ['.svelte'],
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/strict',
        'plugin:import/typescript',
      ],
      rules: {
        '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
        '@typescript-eslint/consistent-type-exports': 'warn',
        '@typescript-eslint/consistent-type-imports': 'warn',
        '@typescript-eslint/method-signature-style': 'warn',
        '@typescript-eslint/no-duplicate-type-constituents': 'warn',
        '@typescript-eslint/no-confusing-void-expression': [
          'warn',
          { ignoreArrowShorthand: true, ignoreVoidOperator: true },
        ],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-redundant-type-constituents': 'warn',
        '@typescript-eslint/no-require-imports': 'error',
        '@typescript-eslint/no-unnecessary-qualifier': 'warn',
        '@typescript-eslint/no-useless-empty-export': 'warn',
        '@typescript-eslint/prefer-enum-initializers': 'error',
        '@typescript-eslint/prefer-regexp-exec': 'warn',
        '@typescript-eslint/promise-function-async': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
      },
    },
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
        'svelte/prefer-class-directive': 'off',
        'svelte/experimental-require-slot-types': 'off',
        'svelte/experimental-require-strict-events': 'off',
        'svelte/@typescript-eslint/no-unnecessary-condition': 'off',
        'unicorn/filename-case': [
          'error',
          { cases: { kebabCase: true, pascalCase: true } },
        ],
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { varsIgnorePattern: '^(\\$\\$(Props|Events|Slots)$|_)' },
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
