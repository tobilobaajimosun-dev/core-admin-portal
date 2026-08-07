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

  userAvatar = computed(() => this.authStore.user()?.profile_image || null);

  getUserInitials(): string {
    const user = this.authStore.user();
    if (!user) return 'U';
    const first = user.first_name?.charAt(0) || '';
    const last = user.last_name?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  getUserFullName(): string {
    const user = this.authStore.user();
    if (!user) return '';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  }

  getUserRoleLabel(): string {
    return this.authStore.user()?.role?.name || 'Member';
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