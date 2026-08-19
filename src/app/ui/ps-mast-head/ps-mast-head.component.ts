import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { AuthStore }          from '@core/store/auth.store';
import { DemoModeService } from '@core/services/demo-mode.service';
import { AppNotification } from '@shared/components/modals/notification-modal/notification-modal.component';
import { NotificationDropdownComponent } from './notification-dropdown/notification-dropdown.component';

@Component({
  selector: 'ps-mast-head',
  standalone: true,
  imports: [CommonModule, FormsModule, PsSvgIconComponent, NotificationDropdownComponent],
  templateUrl: './ps-mast-head.component.html',
  styleUrl: './ps-mast-head.component.scss',
})
export class PsMastHeadComponent implements OnInit, OnDestroy {
  @Output() menuClick = new EventEmitter<void>();

  // ── Auth ──────────────────────────────────────────────────────────────
  authStore    = inject(AuthStore);
  router       = inject(Router);

  user       = this.authStore.user;
  isLoggedIn = this.authStore.isLoggedIn;

  // ── Demo data mode ────────────────────────────────────────────────────
  demoMode = inject(DemoModeService);

  /** Flip demo mode and reload so already-loaded pages refetch through the
   * interceptor with (or without) fixture data. */
  toggleDemo(): void {
    this.demoMode.toggle();
    window.location.reload();
  }

  // ── Search ────────────────────────────────────────────────────────────
  showMobileSearch   = false;
  searchText         = '';
  showSearchDropdown = false;
  isSearching        = signal(false);

  @ViewChild('mobileSearchInput') mobileSearchInput!: ElementRef;

  private searchSubject$ = new Subject<string>();
  private destroy$       = new Subject<void>();
  private hideDropdownTimeout?: number;

  // ── Notifications ─────────────────────────────────────────────────────
  notifications = signal<AppNotification[]>([
    {
      id: '1',
      title: 'Loan repayment!',
      body: 'John Doe (₦50,000) made a repayment to a loan',
      time: '2 hours ago',
      type: 'success',
      read: false,
    },
    {
      id: '2',
      title: 'Loan approved!',
      body: 'John Doe (₦50,000) loan approved',
      time: '2 hours ago',
      type: 'error',
      read: true,
    },
    {
      id: '3',
      title: 'Wallet funded',
      body: 'Jane A. loan request pending review',
      time: '2 hours ago',
      type: 'success',
      read: true,
    },
    {
      id: '4',
      title: 'Failed transaction',
      body: 'Tunde O. – ₦5,000 (reason: insufficient funds)',
      time: '2 hours ago',
      type: 'error',
      read: true,
    },
    {
      id: '5',
      title: 'Electricity payment',
      body: 'Chike A. – ₦7,500 (token expired)',
      time: '2 hours ago',
      type: 'error',
      read: true,
    },
  ]);

  unreadCount = () => this.notifications().filter(n => !n.read).length;

  notifOpen = signal(false);

  toggleNotifications(): void {
    this.notifOpen.update(v => !v);
  }

  closeNotifications(): void {
    this.notifOpen.set(false);
  }

  markAllNotificationsRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.hideDropdownTimeout) clearTimeout(this.hideDropdownTimeout);
  }

  ngAfterViewInit(): void {
    if (this.showMobileSearch && this.mobileSearchInput) {
      setTimeout(() => this.mobileSearchInput.nativeElement.focus(), 100);
    }
  }

  logUserOut(): void {}

  private setupSearch(): void {
    this.searchSubject$
      .pipe(
        takeUntil(this.destroy$),
        filter(text => text !== null && text !== undefined),
        distinctUntilChanged(),
        debounceTime(300),
        tap(() => this.isSearching.set(true)),
        tap(text => { if (!text.trim()) this.isSearching.set(false); })
      )
      .subscribe();
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject$.next(searchTerm);
    this.showSearchDropdown = !!searchTerm.trim();
  }

  /** Global search: route loan-ish queries to loans, otherwise to customers. */
  submitSearch(): void {
    const q = this.searchText.trim();
    if (!q) return;
    const target = /\b(ln|loan)\b|af-ln|af-/i.test(q) ? '/asset-flex/loans' : '/asset-flex/customers';
    this.router.navigate([target], { queryParams: { search: q } });
    this.showMobileSearch = false;
  }

  hideDropdownWithDelay(): void {
    this.hideDropdownTimeout = window.setTimeout(() => {
      this.showSearchDropdown = false;
    }, 200);
  }
}