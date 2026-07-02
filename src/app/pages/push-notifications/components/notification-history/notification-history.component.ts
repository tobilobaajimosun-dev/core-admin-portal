import {
  ChangeDetectionStrategy, Component, computed, inject, signal,
  DestroyRef, OnInit, ViewChildren, QueryList,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { PsRadioComponent } from '@pcsl-ui/ui/ps-radio/ps-radio.component';
import { PsEmptyComponent } from '@pcsl-ui/ui/ps-empty/ps-empty.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { NotificationStore } from '@core/store/notification.store';
import { NotificationHistoryItemRaw } from '@core/interfaces/notification.model';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDef {
  type: 'type' | 'channel' | 'status';
  label: string;
  options: FilterOption[];
}

@Component({
  selector: 'app-notification-history',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule,
    PsPaginationComponent, PsRadioComponent, PsEmptyComponent, DropdownComponent,
  ],
  templateUrl: './notification-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationHistoryComponent implements OnInit {
  @ViewChildren('filterDropdown') filterDropdowns!: QueryList<DropdownComponent>;

  private readonly store      = inject(NotificationStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly history      = computed(() => this.store.historyItems());
  readonly isLoading    = this.store.isLoadingHistory;
  readonly currentPage  = computed(() => this.store.historyCurrentPage());
  readonly pageSize     = computed(() => this.store.historyCurrentLimit());
  readonly totalCount   = computed(() => this.store.historyTotal());

  readonly isExportingHistory = this.store.isExportingHistory;

  searchQuery = signal('');
  openMenuId  = signal<string | null>(null);

  
  readonly statusClass: Partial<Record<string, string>> = {
    delivered: 'bg-[#ECFDF5] text-[#12B76A]',
    pending:   'bg-[#FFFBEB] text-[#F59E0B]',
    failed:    'bg-[#FFF1F2] text-[#F04438]',
  };

  readonly filterDefs: FilterDef[] = [
    {
      type: 'type',
      label: 'Notification Type',
      options: [
        { label: 'Bills',   value: 'bills'   },
        { label: 'Loans',   value: 'loans'   },
        { label: 'Wallets', value: 'wallets' },
      ],
    },
    {
      type: 'channel',
      label: 'Channel',
      options: [
        { label: 'In App', value: 'push' },
        { label: 'Email',  value: 'email' },
        { label: 'SMS', value: 'sms' },

      ],
    },
    {
      type: 'status',
      label: 'Status',
      options: [
        { label: 'Delivered', value: 'delivered' },
        { label: 'Failed',     value: 'failed'     },
      ],
    },
  ];

  selectedValues: string[] = this.filterDefs.map(() => '');
  appliedValues: string[] = this.filterDefs.map(() => '');

  private readonly debouncedSearch$ = toObservable(this.searchQuery).pipe(
    skip(1),
    debounceTime(400),
    distinctUntilChanged(),
  );

  ngOnInit(): void {
    this.store.fetchHistory({ page: 1, limit: 10 });

    this.debouncedSearch$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => this.store.setHistorySearch(query));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getStatusClass(status: string): string {
    return this.statusClass[status] ?? 'bg-[#F3F4F6] text-[#51575B]';
  }

  isFilterActive(i: number): boolean {
    return !!this.appliedValues[i];
  }

  filterDisplayLabel(i: number): string {
    const applied = this.appliedValues[i];
    if (!applied) return this.filterDefs[i].label;
    const opt = this.filterDefs[i].options.find(o => o.value === applied);
    return opt ? `${this.filterDefs[i].label}: ${opt.label}` : this.filterDefs[i].label;
  }

  onRadioChange(i: number, value: string): void {
    this.selectedValues[i] = value;
  }

  applyFilter(i: number, dropdown: DropdownComponent): void {
    dropdown.close();
    const value = this.selectedValues[i];

    // Single filter active at a time — applying one clears the others,
    // matching customer-table / loan-table behavior.
    this.appliedValues = this.appliedValues.map((_, idx) => idx === i ? value : '');
    this.selectedValues = this.selectedValues.map((_, idx) => idx === i ? value : '');

    const def = this.filterDefs[i];
    if (def.type === 'type')    this.store.setHistoryTypeFilter(value);
    if (def.type === 'channel') this.store.setHistoryChannelFilter(value);
    if (def.type === 'status')  this.store.setHistoryStatusFilter(value);
  }

  clearFilter(i: number): void {
    this.appliedValues[i] = '';
    this.selectedValues[i] = '';

    const def = this.filterDefs[i];
    if (def.type === 'type')    this.store.setHistoryTypeFilter('');
    if (def.type === 'channel') this.store.setHistoryChannelFilter('');
    if (def.type === 'status')  this.store.setHistoryStatusFilter('');
  }

  closeOtherDropdowns(currentIndex: number): void {
    this.filterDropdowns.forEach((dropdown: DropdownComponent, i: number) => {
      if (i !== currentIndex) dropdown.close();
      // Discard any unapplied selection every time a pill is opened, so the
      // dropdown always starts fresh reflecting only what's actually applied.
      this.selectedValues[i] = this.appliedValues[i];
    });
  }

  clearAllFilters(): void {
    this.appliedValues = this.filterDefs.map(() => '');
    this.selectedValues = this.filterDefs.map(() => '');
    this.searchQuery.set('');
    this.store.clearHistoryFilters();
  }

  onExport(): void {
  this.store.exportHistory().subscribe();
}

  onPageChange(page: number): void {
    this.store.setHistoryPage(page);
  }

  onPageSizeChange(size: number): void {
    this.store.setHistoryPageSize(size);
  }

  toggleMenu(id: string): void {
    this.openMenuId.update(cur => cur === id ? null : id);
  }

  onView(item: NotificationHistoryItemRaw): void {
    console.log('View', item.id);
    this.openMenuId.set(null);
  }

  onResend(item: NotificationHistoryItemRaw): void {
    console.log('Resend', item.id);
    this.openMenuId.set(null);
  }

  displayType(item: NotificationHistoryItemRaw): string {
    return item.notificationType ?? item.templateSlug;
  }
}