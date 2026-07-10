import { CustomerIssue } from '@core/interfaces/customer.model';

export function issueToLabel(issue: CustomerIssue): string {
  const map: Record<CustomerIssue, string> = {
    INCOMPLETE_ACCOUNT_REGISTRATION:       'Account registration',
    INCOMPLETE_BVN_VERIFICATION:           'BVN verification',
    INCOMPLETE_WALLET_CREATION:            'Wallet creation',
    INCOMPLETE_ACCOUNT_CREATION_ON_CALTOS: 'Account creation',
  };
  return map[issue] ?? issue;
}

export function issueToDescription(issue: CustomerIssue): string {
  const map: Record<CustomerIssue, string> = {
    INCOMPLETE_ACCOUNT_REGISTRATION:
      "This customer hasn't finished registering their account. Send them a reminder to complete registration.",
    INCOMPLETE_BVN_VERIFICATION:
      "This customer hasn't verified their BVN. Send them a reminder to complete BVN verification.",
    INCOMPLETE_WALLET_CREATION:
      "This customer's wallet was never created. Complete wallet creation on their behalf.",
    INCOMPLETE_ACCOUNT_CREATION_ON_CALTOS:
      "This customer's account was never created on Caltos. Complete account creation on their behalf.",
  };
  return map[issue] ?? '';
}

const NOTIFICATION_ISSUES: CustomerIssue[] = [
  'INCOMPLETE_ACCOUNT_REGISTRATION',
  'INCOMPLETE_BVN_VERIFICATION',
];

const COMPLETE_ACTION_ISSUES: CustomerIssue[] = [
  'INCOMPLETE_WALLET_CREATION',
  'INCOMPLETE_ACCOUNT_CREATION_ON_CALTOS',
];

export function issueNeedsNotification(issue: CustomerIssue): boolean {
  return NOTIFICATION_ISSUES.includes(issue);
}

export function issueNeedsCompleteAction(issue: CustomerIssue): boolean {
  return COMPLETE_ACTION_ISSUES.includes(issue);
}