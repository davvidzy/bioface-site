// @ts-check
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

// Regras de a11y em .astro: eslint-plugin-astro carrega o fork eslint-plugin-jsx-a11y-x,
// porque o eslint-plugin-jsx-a11y original ainda não suporta ESLint 10.
export default defineConfig(
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'test-results/',
      'playwright-report/',
      '.lighthouseci/',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  astro.configs['jsx-a11y-strict'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // role="list" em <ul> com list-style: none é intencional: o Safari/VoiceOver
      // descarta a semântica de lista sem ele.
      'astro/jsx-a11y/no-redundant-roles': ['error', { ul: ['list'], ol: ['list'] }],
    },
  },
);
