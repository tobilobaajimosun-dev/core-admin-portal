import { LOAN_STATUS_TRANSITIONS, LOAN_STATUSES } from './loan.model';

describe('LOAN_STATUS_TRANSITIONS', () => {
  it('has an entry for every known loan status', () => {
    for (const status of LOAN_STATUSES) {
      expect(LOAN_STATUS_TRANSITIONS[status]).toBeDefined();
    }
  });

  it('treats PAID_OFF, DEFAULTED and REJECTED as terminal (no outgoing transitions)', () => {
    expect(LOAN_STATUS_TRANSITIONS.PAID_OFF).toEqual([]);
    expect(LOAN_STATUS_TRANSITIONS.DEFAULTED).toEqual([]);
    expect(LOAN_STATUS_TRANSITIONS.REJECTED).toEqual([]);
  });

  it('never lists a status as its own next state', () => {
    for (const [from, tos] of Object.entries(LOAN_STATUS_TRANSITIONS)) {
      expect(tos).not.toContain(from);
    }
  });

  it('guards the specific regression this map fixes: a PAID_OFF loan cannot be reached from PENDING_DISBURSEMENT directly', () => {
    expect(LOAN_STATUS_TRANSITIONS.PENDING_DISBURSEMENT).not.toContain('PAID_OFF');
    expect(LOAN_STATUS_TRANSITIONS.ACTIVE).toContain('PAID_OFF');
  });

  it('only reaches DISBURSED from PENDING_DISBURSEMENT', () => {
    const reachableFrom = Object.entries(LOAN_STATUS_TRANSITIONS)
      .filter(([, tos]) => tos.includes('DISBURSED'))
      .map(([from]) => from);
    expect(reachableFrom).toEqual(['PENDING_DISBURSEMENT']);
  });
});
