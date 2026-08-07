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
import { AppPreferenceService } from '@core/services/app-preference.service';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';

type MenuItem = {
  name: string;
  route: string;
  icon: string;
  app: 'core' | 'asset-flex';
  children: any[];
  expanded?: boolean;
  type?: string;
  subMenu?: { name: string; route: string }[];
};

@Component({
  selector: 'ps-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, PsSvgIconComponent],
  templateUrl: './ps-sidebar.component.html',
  styleUrl: './ps-sidebar.component.scss',
})
export class PsSidebarComponent implements AfterViewInit {
  @Output() closeSidebarEvent = new EventEmitter<void>();

  private authStore = inject(AuthStore);
  private appPreference = inject(AppPreferenceService);
  router = inject(Router);

  /** Which app's session is active — drives which nav items render. Re-read on every navigation. */
  private readonly activeApp = signal(this.appPreference.getActiveApp());

  menus = computed(() => {
    const allMenus: MenuItem[] = [...SIDEBAR_ROUTES] as MenuItem[];
    const active = this.activeApp();
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

  // getUserRole(): string {
  //   const user = this.authStore.user();
  //   if (!user) return '';
  //   return user.profile?.role?.name || 'Administrator';
  // }

  goToProfileSettings(): void {
    this.router.navigate([this.activeApp() === 'asset-flex' ? '/asset-flex/settings' : '/settings']);
  }

  closeSidebar() {
    this.closeSidebarEvent.emit();
  }

  ngAfterViewInit(): void {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.activeApp.set(this.appPreference.getActiveApp()));
  }
}