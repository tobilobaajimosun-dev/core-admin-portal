import { NairaPipe } from './naira.pipe';

describe('NairaPipe', () => {
  const pipe = new NairaPipe();

  it('formats a numeric string with two decimal places', () => {
    expect(pipe.transform('1234.5')).toBe('₦1,234.50');
  });

  it('formats a plain number', () => {
    expect(pipe.transform(1000)).toBe('₦1,000.00');
  });

  it('returns an em dash for null, undefined, and empty string', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform('')).toBe('—');
  });

  it('returns an em dash for a non-numeric string', () => {
    expect(pipe.transform('not-a-number')).toBe('—');
  });

  it('renders negative amounts without special handling (flagged separately as a product gap)', () => {
    expect(pipe.transform('-500')).toBe('₦-500.00');
  });
});
