import { FormControl } from '@angular/forms';
import { minTrimmedLength } from './validators';

describe('minTrimmedLength', () => {
  const validator = minTrimmedLength(5);

  it('rejects whitespace-only input even when it meets the raw length', () => {
    const control = new FormControl('     ');
    expect(validator(control)).toEqual({ minTrimmedLength: { requiredLength: 5, actualLength: 0 } });
  });

  it('rejects input shorter than the minimum after trimming', () => {
    const control = new FormControl('  hi  ');
    expect(validator(control)?.['minTrimmedLength']).toEqual({ requiredLength: 5, actualLength: 2 });
  });

  it('accepts input that meets the minimum after trimming surrounding whitespace', () => {
    const control = new FormControl('  hello  ');
    expect(validator(control)).toBeNull();
  });

  it('accepts exactly the minimum length', () => {
    const control = new FormControl('abcde');
    expect(validator(control)).toBeNull();
  });
});
