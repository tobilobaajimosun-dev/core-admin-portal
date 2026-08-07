/** Turns SNAKE_CASE / snake_case tokens into "Title Case" (e.g. SUPER_ADMIN → "Super Admin"). */
export function formatLabel(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
