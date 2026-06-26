import { CustomerIssue } from '@core/interfaces/customer.model';

export function issueToLabel(issue: CustomerIssue): string {
  const map: Record<CustomerIssue, string> = {
    INCOMPLETE_BVN_VERIFICATION:           'BVN verification',
    INCOMPLETE_WALLET_CREATION:            'Wallet creation',
    INCOMPLETE_ACCOUNT_CREATION_ON_CALTOS: 'Account creation',
  };
  return map[issue] ?? issue;
}