import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier/flat';

export default [
  // Mirrors the folders in .gitignore: flat config has no --ignore-path.
  {
    ignores: [
      'node_modules/',
      'example/node_modules/',
      '.tmp/',
      '_site/',
      'dist/',
      'build/',
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
    },
  },
  prettier,
];
