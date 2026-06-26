/**
 * patch-tailwind.mjs
 *
 * Tailwind CSS v4 requires `@reference` at the top of any component-scoped
 * SCSS file that uses `@apply`. This script prepends the directive to the
 * known offending files before the Angular build runs.
 *
 * Run automatically via the "prestart" / "prebuild" npm hooks.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

/**
 * Path to your global stylesheet (the one that contains `@import "tailwindcss"`
 * or `@tailwind base/components/utilities`).
 * Adjust if your entry CSS lives somewhere else.
 */
const GLOBAL_CSS_PATH = 'src/styles.css';

/**
 * Component SCSS files that use @apply but live in their own scope.
 * Add any future offenders here rather than modifying the shared components.
 */
const FILES_TO_PATCH = [
  'pcsl-ui/ui/ps-radio/ps-radio.component.scss',
  'pcsl-ui/ui/ps-select/ps-select.component.scss',
];

const REFERENCE_DIRECTIVE = `@reference "${GLOBAL_CSS_PATH}";\n`;

for (const relPath of FILES_TO_PATCH) {
  const absPath = resolve(ROOT, relPath);

  let content;
  try {
    content = readFileSync(absPath, 'utf8');
  } catch {
    console.warn(`[patch-tailwind] Skipping (not found): ${relPath}`);
    continue;
  }

  if (content.startsWith('@reference')) {
    console.log(`[patch-tailwind] Already patched, skipping: ${relPath}`);
    continue;
  }

  writeFileSync(absPath, REFERENCE_DIRECTIVE + content, 'utf8');
  console.log(`[patch-tailwind] Patched: ${relPath}`);
}

console.log('[patch-tailwind] Done.');
