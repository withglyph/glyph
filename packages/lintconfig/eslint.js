import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import imports from 'eslint-plugin-import';
import importsSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import svelteParser from 'svelte-eslint-parser';
import { ignore } from './eslint-ignore.js';

const compat = new FlatCompat();

/** @type {import('eslint').Linter.FlatConfig[]} */
// eslint-disable-next-line import/no-default-export
export default [
  { ignores: [ignore] },
  js.configs.recommended,
  ...compat.extends(
    'plugin:unicorn/recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:svelte/recommended',
    'plugin:svelte/prettier',
  ),
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: true,
        extraFileExtensions: ['.svelte'],
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: { 'import': imports, 'import-sort': importsSort },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-confusing-void-expression': 'off',
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/first': 'error',
      'import/newline-after-import': ['error', { considerComments: true }],
      'import/no-default-export': 'error',
      'import/no-duplicates': 'error',
      'import/no-named-default': 'error',
      'import-sort/exports': 'error',
      'import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            [
              '^node:',
              '^@?\\w',
              '^',
              '^\\.',
              '^node:.*\\u0000$',
              '^@?\\w.*\\u0000$',
              '\\u0000$',
              '^\\..*\\u0000$',
            ],
          ],
        },
      ],
      'unicorn/catch-error-name': ['error', { name: 'err' }],
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/switch-case-braces': 'off',
    },
  },
  {
    files: ['**/*.?(c)js', '**/*.config.?(c)ts', '**/service-worker.ts'],
    languageOptions: { parserOptions: { project: null } },
    rules: { ...typescript.configs['disable-type-checked'].rules },
  },
  {
    files: ['**/*.config.[jt]s'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^\\$\\$(Props|Events|Slots)$' },
      ],
      'unicorn/filename-case': [
        'error',
        { cases: { kebabCase: true, pascalCase: true } },
      ],
      'unicorn/no-useless-undefined': 'off',
    },
  },
  ...compat.extends('prettier'),
];
