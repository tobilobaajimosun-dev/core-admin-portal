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
 * Use the bare "tailwindcss" specifier — this is always resolvable by the
 * SCSS/PostCSS pipeline regardless of the file's location in the tree,
 * and avoids path-resolution failures in Docker where `src/styles.css`
 * is not on the module resolution path.
 */
const REFERENCE_DIRECTIVE = `@reference "tailwindcss";\n`;

/**
 * Component SCSS files that use @apply but live in their own scope.
 * Add any future offenders here rather than modifying the shared components.
 */
const FILES_TO_PATCH = [
  'pcsl-ui/ui/ps-radio/ps-radio.component.scss',
  'pcsl-ui/ui/ps-select/ps-select.component.scss',
];

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