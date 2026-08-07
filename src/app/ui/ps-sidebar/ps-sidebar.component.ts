import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  EventEmitter,
  inject,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SIDEBAR_ROUTES } from './routes';
import { filter } from 'rxjs';
import { AuthStore } from '@core/store/auth.store';
import { LoggedInUser } from '@core/interfaces/auth.model';
import { AppPreferenceService, AppKey } from '@core/services/app-preference.service';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import {
  DropdownComponent,
  DropdownHeaderDirective,
  DropdownMenuDirective,
} from '@shared/components/dropdown/dropdown.component';

type MenuItem = {
  name: string;
  route: string;
  icon: string;
  app: 'core' | 'asset-flex';
  section: number;
  children: any[];
  expanded?: boolean;
  type?: string;
  subMenu?: { name: string; route: string }[];
};

const APPS: { key: AppKey; name: string; route: string }[] = [
  { key: 'core', name: 'Core Admin', route: '/home' },
  { key: 'asset-flex', name: 'Asset Flex Admin', route: '/asset-flex/dashboard' },
];

@Component({
  selector: 'ps-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PsSvgIconComponent,
    DropdownComponent,
    DropdownHeaderDirective,
    DropdownMenuDirective,
  ],
  templateUrl: './ps-sidebar.component.html',
  styleUrl: './ps-sidebar.component.scss',
})
export class PsSidebarComponent implements AfterViewInit {
  @Output() closeSidebarEvent = new EventEmitter<void>();

  private authStore = inject(AuthStore);
  private appPreference = inject(AppPreferenceService);
  router = inject(Router);

  protected readonly apps = APPS;

  /** Which app's session is active — drives which nav items render. Re-read on every navigation. */
  protected readonly activeAppSignal = signal(this.appPreference.getActiveApp());

  menus = computed(() => {
    const allMenus: MenuItem[] = [...SIDEBAR_ROUTES] as MenuItem[];
    const active = this.activeAppSignal();
    return allMenus.filter((m) => m.app === active);
  });

  userAvatar = computed(() => {
    const u = this.rawUser();
    return u?.['profile_image'] || u?.['profileImage'] || u?.['avatar_url'] || u?.['avatarUrl'] || null;
  });

  /**
   * The real login response's field names aren't guaranteed to match this app's
   * LoggedInUser interface exactly — tolerate common snake_case/camelCase variants
   * instead of rendering a blank name/avatar when they don't line up.
   */
  private rawUser(): Record<string, any> | null {
    return (this.authStore.user() as unknown as Record<string, any>) || null;
  }

  private firstName(): string {
    const u = this.rawUser();
    return u?.['first_name'] || u?.['firstName'] || u?.['given_name'] || '';
  }

  private lastName(): string {
    const u = this.rawUser();
    return u?.['last_name'] || u?.['lastName'] || u?.['family_name'] || u?.['surname'] || '';
  }

  private fallbackFullName(): string {
    const u = this.rawUser();
    return u?.['name'] || u?.['full_name'] || u?.['fullName'] || u?.['display_name'] || '';
  }

  getUserInitials(): string {
    const user = this.rawUser();
    if (!user) return 'U';
    const first = this.firstName();
    const last = this.lastName();
    if (first || last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || 'U';
    const fullName = this.fallbackFullName();
    if (fullName) {
      const [a, b] = fullName.trim().split(/\s+/);
      return `${a?.[0] ?? ''}${b?.[0] ?? ''}`.toUpperCase() || 'U';
    }
    const email = user['email'] as string | undefined;
    return email ? email.charAt(0).toUpperCase() : 'U';
  }

  getUserFullName(): string {
    const user = this.rawUser();
    if (!user) return '';
    const combined = `${this.firstName()} ${this.lastName()}`.trim();
    if (combined) return combined;
    const fallback = this.fallbackFullName();
    if (fallback) return fallback;
    return (user['email'] as string) || '';
  }

  getUserRoleLabel(): string {
    const u = this.rawUser();
    const role = u?.['role'];
    const roleName = typeof role === 'string' ? role : role?.name;
    return roleName || 'Member';
  }

  protected isNewSection(index: number): boolean {
    const list = this.menus();
    return index > 0 && list[index].section !== list[index - 1].section;
  }

  protected onSelectApp(app: AppKey): void {
    if (app === this.activeAppSignal()) return;
    this.appPreference.switchApp(app);
    this.activeAppSignal.set(app);
    const target = this.apps.find((a) => a.key === app);
    this.router.navigate([target?.route ?? '/home']);
  }

  protected logOut(): void {
    this.authStore.logOut();
  }

  closeSidebar() {
    this.closeSidebarEvent.emit();
  }

  ngAfterViewInit(): void {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.activeAppSignal.set(this.appPreference.getActiveApp()));
  }
}