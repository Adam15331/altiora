// ESLint (flat config). Lints the modules added for the requirements data
// model, the Node tooling and the tests. The legacy browser files — main.js
// (8.5k lines), state.js and the large data/*.js files — predate any
// linter; they are syntax-checked by scripts/check-syntax.mjs instead and
// can be brought under ESLint in their own cleanup pass.
import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', 'fields/**', 'main.js', 'state.js', 'data/*.js', 'scripts/check-links.mjs'],
  },
  js.configs.recommended,
  {
    files: ['**/*.mjs'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node } },
  },
  {
    // Classic browser scripts that also export for Node.
    files: ['requirements-view.js', 'ib-hl.js', 'data/requirements/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: { ...globals.browser, module: 'writable' } },
  },
  {
    // Playwright scripts: code passed to page.evaluate runs in the browser.
    files: ['scripts/verify-pass/matching/*.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
    },
  },
];
