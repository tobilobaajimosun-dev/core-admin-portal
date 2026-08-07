import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

/**
 * Maps a 422-style API error onto reactive-form controls so messages appear
 * under the offending field. Supports `error.errors` as either
 * `{ field: string }` or `{ field: string[] }`. Returns the top-level message
 * (for a toast) when present. Unknown fields are ignored.
 */
export function applyServerErrors(form: FormGroup, error: unknown): string | null {
  if (!(error instanceof HttpErrorResponse)) return null;
  const body = error.error;
  if (!body || typeof body !== 'object') return null;

  const fieldErrors = (body as Record<string, unknown>)['errors'];
  if (fieldErrors && typeof fieldErrors === 'object') {
    for (const [field, messages] of Object.entries(fieldErrors as Record<string, unknown>)) {
      const control = form.get(field);
      if (!control) continue;
      const message = Array.isArray(messages) ? String(messages[0]) : String(messages);
      control.setErrors({ ...(control.errors ?? {}), server: message });
      control.markAsTouched();
    }
  }

  const message = (body as Record<string, unknown>)['message'];
  return typeof message === 'string' ? message : null;
}
