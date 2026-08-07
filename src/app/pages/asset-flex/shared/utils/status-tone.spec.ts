import { statusTone } from './status-tone';

describe('statusTone', () => {
  it('maps success-family statuses to success', () => {
    for (const s of ['APPROVED', 'ACTIVE', 'DISBURSED', 'PAID_OFF', 'SETTLED']) {
      expect(statusTone(s)).toBe('success');
    }
  });

  it('maps pending-family statuses to warning', () => {
    for (const s of ['PENDING_APPROVAL', 'PENDING', 'PENDING_DISBURSEMENT', 'DUE']) {
      expect(statusTone(s)).toBe('warning');
    }
  });

  it('maps failure-family statuses to danger', () => {
    for (const s of ['REJECTED', 'BLACKLISTED', 'DEFAULTED', 'OVERDUE', 'FAILED']) {
      expect(statusTone(s)).toBe('danger');
    }
  });

  it('maps suspended/inactive statuses to neutral', () => {
    expect(statusTone('SUSPENDED')).toBe('neutral');
    expect(statusTone('INACTIVE')).toBe('neutral');
  });

  it('is case-insensitive', () => {
    expect(statusTone('active')).toBe('success');
  });

  it('defaults unknown/null/undefined statuses to neutral', () => {
    expect(statusTone('SOME_UNKNOWN_STATUS')).toBe('neutral');
    expect(statusTone(null)).toBe('neutral');
    expect(statusTone(undefined)).toBe('neutral');
  });
});
