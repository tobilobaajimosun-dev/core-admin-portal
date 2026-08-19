export type NotificationChannel = 'dashboard' | 'email';

/** A notification an admin composed and sent to one or more businesses. */
export interface SentNotification {
  id: string;
  subject: string;
  body: string;
  /** Business names, or the single entry "All businesses". */
  recipients: string[];
  recipientCount: number;
  channels: NotificationChannel[];
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  sentAt: string;
  sentBy: string;
}
