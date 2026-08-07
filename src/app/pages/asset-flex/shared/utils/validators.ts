import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Rejects whitespace-only input; requires the trimmed value to be at least `min` characters. */
export function minTrimmedLength(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value.trim() : '';
    return value.length >= min ? null : { minTrimmedLength: { requiredLength: min, actualLength: value.length } };
  };
}
