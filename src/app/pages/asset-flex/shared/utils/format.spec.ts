import { formatLabel } from './format';

describe('formatLabel', () => {
  it('turns SNAKE_CASE into Title Case', () => {
    expect(formatLabel('SUPER_ADMIN')).toBe('Super Admin');
  });

  it('turns snake_case into Title Case', () => {
    expect(formatLabel('pending_approval')).toBe('Pending Approval');
  });

  it('handles a single word', () => {
    expect(formatLabel('ACTIVE')).toBe('Active');
  });

  it('returns an empty string for null/undefined/empty input', () => {
    expect(formatLabel(null)).toBe('');
    expect(formatLabel(undefined)).toBe('');
    expect(formatLabel('')).toBe('');
  });
});
