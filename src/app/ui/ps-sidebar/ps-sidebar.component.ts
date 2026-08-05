import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  EventEmitter,
  inject,
  Output,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SIDEBAR_ROUTES } from './routes';
import { filter } from 'rxjs';
import { AuthStore } from '@core/store/auth.store';
import { LoggedInUser } from '@core/interfaces/auth.model';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';

type MenuItem = {
  name: string;
  route: string;
  icon: string;
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
  router = inject(Router);

  menus = computed(() => {
    const allMenus: MenuItem[] = [...SIDEBAR_ROUTES];
    return allMenus;
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
    this.router.navigate(['/settings']); // adjust to your actual settings route
  }

  closeSidebar() {
    this.closeSidebarEvent.emit();
  }

  logOut() {
    this.authStore.logOut();
  }

  ngAfterViewInit(): void {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe();
  }
}