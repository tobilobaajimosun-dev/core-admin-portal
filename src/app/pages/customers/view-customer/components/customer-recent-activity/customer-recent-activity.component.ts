import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PsSvgIconComponent }    from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';

export interface TimelineEvent {
  title: string;
  description: string;
  time: string;
  isActive: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  module: string;
  ipAddress: string;
  dateTime: string;
  device: string;
  rawPayload: Record<string, unknown>;
  timeline: TimelineEvent[];
}

@Component({
  selector: 'app-customer-recent-activity',
  standalone: true,
  imports: [CommonModule, DatePipe, PsSvgIconComponent, PsPaginationComponent],
  templateUrl: './customer-recent-activity.component.html',
})
export class CustomerRecentActivityComponent {
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  columns       = ['Action', 'Module', 'IP Address', 'Date & Time', ''];
  filterOptions = ['Activity Module'];

  activityLogs = signal<ActivityLog[]>([
    {
      id: 'ACT-1041', action: 'Reset password', module: 'Auth',
      ipAddress: '102.89.12.45', dateTime: '2024-05-08T11:42:00', device: 'Android',
      rawPayload: { eventId: 'ACT-1041', adminId: 'USR-001', adminEmail: 'lademi@princeps.ng',
        action: 'UPDATE_LOAN_STATUS', resource: { type: 'loan', id: 'LN-8821' } },
      timeline: [
        { title: 'Action committed',   description: 'Reset password',               time: '11:42:03 AM', isActive: true  },
        { title: 'Validation passed',  description: 'All required fields verified',  time: '11:42:03 AM', isActive: false },
        { title: 'Validation failed',  description: 'Missing email address',         time: '11:45:15 AM', isActive: false },
        { title: 'Validation warning', description: 'Password strength weak',        time: '11:47:29 AM', isActive: false },
        { title: 'Validation passed',  description: 'Optional fields completed',     time: '11:50:02 AM', isActive: false },
      ],
    },
    {
      id: 'ACT-1040', action: 'Change email address', module: 'Profile',
      ipAddress: '203.56.78.90', dateTime: '2024-05-08T12:15:00', device: 'iOS',
      rawPayload: { eventId: 'ACT-1040', action: 'CHANGE_EMAIL' },
      timeline: [
        { title: 'Action committed',  description: 'Change email address', time: '12:15:00 PM', isActive: true  },
        { title: 'Validation passed', description: 'All fields verified',   time: '12:15:02 PM', isActive: false },
      ],
    },
    {
      id: 'ACT-1039', action: 'Update profile picture', module: 'Profile',
      ipAddress: '192.168.1.1', dateTime: '2024-05-08T14:30:00', device: 'Web',
      rawPayload: { eventId: 'ACT-1039', action: 'UPDATE_AVATAR' },
      timeline: [
        { title: 'Action committed',  description: 'Update profile picture', time: '2:30:00 PM', isActive: true  },
        { title: 'Validation passed', description: 'Image uploaded',          time: '2:30:05 PM', isActive: false },
      ],
    },
    {
      id: 'ACT-1038', action: 'Set two-factor authentication', module: 'Profile',
      ipAddress: '10.0.0.254', dateTime: '2024-05-08T13:03:00', device: 'Android',
      rawPayload: { eventId: 'ACT-1038', action: 'SET_2FA' },
      timeline: [
        { title: 'Action committed',  description: 'Enable 2FA',   time: '1:03:00 PM', isActive: true  },
        { title: 'Validation passed', description: 'OTP verified', time: '1:03:10 PM', isActive: false },
      ],
    },
    {
      id: 'ACT-1037', action: 'Manage notification preferences', module: 'Profile',
      ipAddress: '172.16.32.10', dateTime: '2024-05-08T16:45:00', device: 'Web',
      rawPayload: { eventId: 'ACT-1037', action: 'UPDATE_NOTIFICATIONS' },
      timeline: [
        { title: 'Action committed',  description: 'Update preferences', time: '4:45:00 PM', isActive: true  },
        { title: 'Validation passed', description: 'Settings saved',      time: '4:45:02 PM', isActive: false },
      ],
    },
  ]);

  openDetail(log: ActivityLog): void {
    this.router.navigate(
      ['activity-log', log.id],
      { relativeTo: this.route, state: { log } }
    );
  }

  onPageChange(page: number): void {}
  onPageSizeChange(size: number): void {}
}