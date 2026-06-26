import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { ProfileComponent } from './components/profile/profile.component';
import { EmailNotificationsComponent } from './components/email-notifications/email-notifications.component';
import { SecurityComponent } from './components/security/security.component';

export type SettingsTab = 'profile' | 'email-notifications' | 'security';

interface Tab {
  value: SettingsTab;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    PsSvgIconComponent,
    ProfileComponent,
    EmailNotificationsComponent,
    SecurityComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {

  activeTab = signal<SettingsTab>('profile');

  tabs: Tab[] = [
    { value: 'profile',             label: 'Profile',             icon: 'profile-icon'       },
    { value: 'email-notifications', label: 'Email notifications', icon: 'email-notification-icon'  },
    { value: 'security',            label: 'Security',            icon: 'security-icon'      },
  ];
}