import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Output,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SIDEBAR_ROUTES } from './routes';
import { filter } from 'rxjs';
import { AuthStore } from '@core/store/auth.store';
import { LoggedInUser } from '@core/interfaces/auth.model';
import { AppPreferenceService, AppKey } from '@core/services/app-preference.service';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';

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

const APPS: { key: AppKey; name: string; route: string; initials: string; accent: string }[] = [
  { key: 'core', name: 'Core Admin', route: '/home', initials: 'CA', accent: '#0084c0' },
  { key: 'asset-flex', name: 'Asset Flex Admin', route: '/asset-flex/dashboard', initials: 'AF', accent: '#00b3ff' },
];

@Component({
  selector: 'ps-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, PsSvgIconComponent],
  templateUrl: './ps-sidebar.component.html',
  styleUrl: './ps-sidebar.component.scss',
})
export class PsSidebarComponent {
  @Output() closeSidebarEvent = new EventEmitter<void>();

  private authStore = inject(AuthStore);
  private appPreference = inject(AppPreferenceService);
  private elementRef = inject(ElementRef<HTMLElement>);
  router = inject(Router);

  protected readonly apps = APPS;
  protected readonly profileMenuOpen = signal(false);

  /**
   * Which app's nav renders — derived from the CURRENT URL, not the stored
   * preference. A stored preference only decides where a fresh login/guard
   * redirect lands; once inside the shell, the sidebar must always match
   * whatever page is actually on screen, or it silently shows the wrong app's
   * nav next to the right app's content (e.g. landing on core-admin's own
   * /home while a stale 'asset-flex' preference was still set).
   */
  protected readonly activeAppSignal = signal<AppKey>(this.appFromUrl(this.router.url));

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.activeAppSignal.set(this.appFromUrl((e as NavigationEnd).urlAfterRedirects));
      this.profileMenuOpen.set(false);
    });
  }

  private appFromUrl(url: string): AppKey {
    return url.startsWith('/asset-flex') ? 'asset-flex' : 'core';
  }

  menus = computed(() => {
    const allMenus: MenuItem[] = [...SIDEBAR_ROUTES] as MenuItem[];
    const active = this.activeAppSignal();
    return allMenus.filter((m) => m.app === active);
  });

  /** Up to 3 most-recently-used apps, current app first. */
  protected recentApps() {
    const order = this.appPreference.getRecentApps();
    const byKey = new Map(this.apps.map((a) => [a.key, a]));
    const ordered = order.map((k) => byKey.get(k)).filter((a): a is (typeof APPS)[number] => !!a);
    const remaining = this.apps.filter((a) => !order.includes(a.key));
    return [...ordered, ...remaining].slice(0, 3);
  }

  userAvatar = computed(() => {
    const u = this.rawUser();
    return u?.['profile_image'] || u?.['profileImage'] || u?.['avatar_url'] || u?.['avatarUrl'] || null;
  });

  /**
   * The real login response's field names aren't guaranteed to match this app's
   * LoggedInUser interface exactly — tolerate common snake_case/camelCase variants
   * instead of rendering blank fields when they don't line up.
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

  /** Not every account will have a department set — returns '' rather than a placeholder when absent. */
  getUserDepartment(): string {
    const u = this.rawUser();
    const dept = u?.['department'] || u?.['team'] || u?.['business_unit'] || u?.['businessUnit'] || u?.['unit'];
    return typeof dept === 'string' ? dept : dept?.name || '';
  }

  /** Compact sidebar trigger label — "Wisdom - Technology", falling back to just the name when no department is set. */
  getSidebarLabel(): string {
    const first = this.firstName() || this.getUserFullName();
    const department = this.getUserDepartment();
    return department ? `${first} - ${department}` : first;
  }

  protected isNewSection(index: number): boolean {
    const list = this.menus();
    return index > 0 && list[index].section !== list[index - 1].section;
  }

  protected toggleProfileMenu(): void {
    this.profileMenuOpen.update((open) => !open);
  }

  protected onSelectApp(app: AppKey): void {
    this.profileMenuOpen.set(false);
    if (app === this.activeAppSignal()) return;
    this.appPreference.switchApp(app);
    const target = this.apps.find((a) => a.key === app);
    this.router.navigate([target?.route ?? '/home']);
  }

  protected logOut(): void {
    this.profileMenuOpen.set(false);
    this.authStore.logOut();
  }

  closeSidebar() {
    this.closeSidebarEvent.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.profileMenuOpen() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.profileMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.profileMenuOpen.set(false);
  }
}
