import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppKey, AppPreferenceService } from '@core/services/app-preference.service';

interface AdminApp {
  key: AppKey;
  name: string;
  description: string;
  initials: string;
  accent: string;
  route: string;
}

@Component({
  selector: 'app-select-app',
  imports: [],
  templateUrl: './select-app.component.html',
  styleUrl: './select-app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectAppComponent {
  private readonly router = inject(Router);
  private readonly appPreference = inject(AppPreferenceService);

  protected readonly remember = signal(false);

  protected readonly apps: AdminApp[] = [
    {
      key: 'core',
      name: 'Core Admin',
      description: 'Customers, loans, wallets, VAS & audit logs',
      initials: 'CA',
      accent: '#0084c0',
      route: '/home',
    },
    {
      key: 'asset-flex',
      name: 'Asset Flex Admin',
      description: 'Vendors, KYB approvals, checkout financing & settlements',
      initials: 'AF',
      accent: '#00b3ff',
      route: '/asset-flex/dashboard',
    },
  ];

  protected chooseApp(app: AdminApp): void {
    this.appPreference.chooseApp(app.key, this.remember());
    this.router.navigateByUrl(app.route);
  }
}
