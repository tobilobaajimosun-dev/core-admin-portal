import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { applyServerErrors } from './apply-server-errors';

describe('applyServerErrors', () => {
  function buildForm() {
    return new FormGroup({
      email: new FormControl(''),
      password: new FormControl(''),
    });
  }

  it('returns null and touches nothing for a non-HttpErrorResponse error', () => {
    const form = buildForm();
    const result = applyServerErrors(form, new Error('boom'));
    expect(result).toBeNull();
    expect(form.controls.email.touched).toBe(false);
  });

  it('sets a field error from a string message and marks the control touched', () => {
    const form = buildForm();
    const error = new HttpErrorResponse({ error: { errors: { email: 'Email is already taken' } } });
    applyServerErrors(form, error);
    expect(form.controls.email.errors?.['server']).toBe('Email is already taken');
    expect(form.controls.email.touched).toBe(true);
  });

  it('takes the first message when a field error is an array', () => {
    const form = buildForm();
    const error = new HttpErrorResponse({ error: { errors: { password: ['Too short', 'Needs a number'] } } });
    applyServerErrors(form, error);
    expect(form.controls.password.errors?.['server']).toBe('Too short');
  });

  it('ignores field errors for controls that do not exist on the form', () => {
    const form = buildForm();
    const error = new HttpErrorResponse({ error: { errors: { nonexistent_field: 'Some error' } } });
    expect(() => applyServerErrors(form, error)).not.toThrow();
  });

  it('returns the top-level message for a toast', () => {
    const form = buildForm();
    const error = new HttpErrorResponse({ error: { message: 'Validation failed' } });
    expect(applyServerErrors(form, error)).toBe('Validation failed');
  });

  it('returns null when there is no top-level message', () => {
    const form = buildForm();
    const error = new HttpErrorResponse({ error: { errors: {} } });
    expect(applyServerErrors(form, error)).toBeNull();
  });
});
