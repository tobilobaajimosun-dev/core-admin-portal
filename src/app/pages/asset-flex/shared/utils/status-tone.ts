import { BadgeTone } from '../components/status-badge/status-badge.component';

/** Maps a status token (vendor / user / document / loan / settlement) to a badge tone. */
export function statusTone(status: string | null | undefined): BadgeTone {
  switch ((status ?? '').toUpperCase()) {
    case 'APPROVED':
    case 'ACTIVE':
    case 'DISBURSED':
    case 'PAID_OFF':
    case 'SETTLED':
      return 'success';
    case 'PENDING_APPROVAL':
    case 'PENDING':
    case 'PENDING_DISBURSEMENT':
    case 'DUE':
      return 'warning';
    case 'REJECTED':
    case 'BLACKLISTED':
    case 'DEFAULTED':
    case 'OVERDUE':
    case 'FAILED':
      return 'danger';
    case 'SUSPENDED':
    case 'INACTIVE':
      return 'neutral';
    default:
      return 'neutral';
  }
}
