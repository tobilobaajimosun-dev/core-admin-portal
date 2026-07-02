import {
  ChangeDetectionStrategy, Component, computed, inject, signal,
  DestroyRef, OnInit, ViewChildren, QueryList,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { PsRadioComponent } from '@pcsl-ui/ui/ps-radio/ps-radio.component';
import { PsEmptyComponent } from '@pcsl-ui/ui/ps-empty/ps-empty.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { TemplateModalComponent } from '@shared/components/modals/template-modal/template-modal.component';
import { NotificationStore } from '@core/store/notification.store';
import { NotificationTemplateRaw } from '@core/interfaces/notification.model';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDef {
  type: 'channel' | 'dateRange';
  label: string;
  options: FilterOption[];
  supportsCustomRange?: boolean;
}

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule, ReactiveFormsModule,
    PsPaginationComponent, PsRadioComponent, PsEmptyComponent, DropdownComponent, PsSvgIconComponent
  ],
  templateUrl: './template-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateListComponent implements OnInit {
  @ViewChildren('filterDropdown') filterDropdowns!: QueryList<DropdownComponent>;

  private readonly fb           = inject(NonNullableFormBuilder);
  private readonly modalService = inject(PsModalService);
  private readonly store        = inject(NotificationStore);
  private readonly destroyRef   = inject(DestroyRef);

  readonly templates    = computed(() => this.store.templates());
  readonly isLoading    = this.store.isLoadingTemplates;
  readonly currentPage  = computed(() => this.store.templateCurrentPage());
  readonly pageSize     = computed(() => this.store.templateCurrentLimit());
  readonly totalCount   = computed(() => this.store.templatesTotal());

  searchQuery = signal('');
  openMenuId  = signal<string | null>(null);

    readonly filterDefs: FilterDef[] = [
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
      type: 'dateRange',
      label: 'Date Range',
      supportsCustomRange: true,
      options: [
        { label: 'Today',        value: 'today' },
        { label: 'Yesterday',    value: 'yesterday' },
        { label: 'Last 7 Days',  value: 'last_7_days' },
        { label: 'Last 30 Days', value: 'last_30_days' },
        { label: 'Custom range', value: 'custom_range' },
      ],
    },
  ];

  selectedValues: string[] = this.filterDefs.map(() => '');
  appliedValues: string[] = this.filterDefs.map(() => '');
  showCustomRange: boolean[] = this.filterDefs.map(() => false);

  customRangeForms = this.filterDefs.map(() =>
    this.fb.group({ start_date: [''], end_date: [''] })
  );

  private readonly debouncedSearch$ = toObservable(this.searchQuery).pipe(
    skip(1),
    debounceTime(400),
    distinctUntilChanged(),
  );

  ngOnInit(): void {
    this.store.fetchTemplates({ page: 1, limit: 10, sortField: 'createdAt', sortOrder: 'DESC' });

    this.debouncedSearch$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => this.store.setTemplateSearch(query));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  isFilterActive(i: number): boolean {
    return !!this.appliedValues[i];
  }

  filterDisplayLabel(i: number): string {
    const applied = this.appliedValues[i];
    if (!applied) return this.filterDefs[i].label;
    if (applied === 'custom_range') return `${this.filterDefs[i].label}: Custom`;
    const opt = this.filterDefs[i].options.find(o => o.value === applied);
    return opt ? `${this.filterDefs[i].label}: ${opt.label}` : this.filterDefs[i].label;
  }

  onRadioChange(i: number, value: string): void {
    this.selectedValues[i] = value;
    this.showCustomRange[i] = value === 'custom_range';
    if (value !== 'custom_range') this.customRangeForms[i].reset();
  }

  applyFilter(i: number, dropdown: DropdownComponent): void {
    dropdown.close();
    const value = this.selectedValues[i];

    this.appliedValues = this.appliedValues.map((_, idx) => idx === i ? value : '');
    this.selectedValues = this.selectedValues.map((_, idx) => idx === i ? value : '');
    this.showCustomRange = this.showCustomRange.map((_, idx) => idx === i ? this.showCustomRange[idx] : false);
    this.customRangeForms.forEach((f, idx) => { if (idx !== i) f.reset(); });

    const def = this.filterDefs[i];

    if (def.type === 'channel') {
      this.store.setTemplateChannelFilter(value);
      return;
    }

    // dateRange
    if (value === 'custom_range') {
      const { start_date, end_date } = this.customRangeForms[i].getRawValue();
      if (start_date && end_date) {
        this.store.setTemplateDateRange(start_date, end_date);
      }
      return;
    }

    const range = this.resolvePresetRange(value);
    if (range) this.store.setTemplateDateRange(range.start, range.end);
  }

  clearFilter(i: number): void {
    this.appliedValues[i] = '';
    this.selectedValues[i] = '';
    this.showCustomRange[i] = false;
    this.customRangeForms[i].reset();

    const def = this.filterDefs[i];
    if (def.type === 'channel') this.store.setTemplateChannelFilter('');
    if (def.type === 'dateRange') this.store.clearTemplateFilters();
  }

  clearAllFilters(): void {
    this.appliedValues = this.filterDefs.map(() => '');
    this.selectedValues = this.filterDefs.map(() => '');
    this.showCustomRange = this.filterDefs.map(() => false);
    this.customRangeForms.forEach(f => f.reset());
    this.searchQuery.set('');
    this.store.clearTemplateFilters();
  }

  closeOtherDropdowns(currentIndex: number): void {
    this.filterDropdowns.forEach((dropdown: DropdownComponent, i: number) => {
      if (i !== currentIndex) dropdown.close();
      this.selectedValues[i] = this.appliedValues[i];
    });
  }

  // Converts a preset label into YYYY-MM-DD start/end strings for the API.
  private resolvePresetRange(value: string): { start: string; end: string } | null {
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const today = new Date();

    switch (value) {
      case 'today':
        return { start: fmt(today), end: fmt(today) };
      case 'yesterday': {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return { start: fmt(y), end: fmt(y) };
      }
      case 'last_7_days': {
        const start = new Date(today);
        start.setDate(start.getDate() - 6);
        return { start: fmt(start), end: fmt(today) };
      }
      case 'last_30_days': {
        const start = new Date(today);
        start.setDate(start.getDate() - 29);
        return { start: fmt(start), end: fmt(today) };
      }
      default:
        return null;
    }
  }

  onPageChange(page: number): void {
    this.store.setTemplatePage(page);
  }

  onPageSizeChange(size: number): void {
    this.store.setTemplatePageSize(size);
  }

  // Create
  openCreateModal(): void {
    this.modalService.open(TemplateModalComponent, {
      maxWidth: '680px',
      isCentered: true,
    });
  }

  // Edit
  onEdit(t: NotificationTemplateRaw): void {
    this.modalService.open(TemplateModalComponent, {
      maxWidth: '680px',
      isCentered: true,
      data: { template: t },
    });
    this.openMenuId.set(null);
  }

  toggleMenu(id: string): void {
    this.openMenuId.update(cur => cur === id ? null : id);
  }

  // Derives a readable name from the slug since the API has no `name`
  // field — e.g. 'loan-disbursed' → 'Loan Disbursed'.
  displayName(t: NotificationTemplateRaw): string {
    return t.slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  channelBadgeClass(channel: string): string {
    const map: Partial<Record<string, string>> = {
      email: 'bg-[#EEF5F9] text-[#0E6DA8]',
      push:  'bg-[#FFF7ED] text-[#C2590A]',
      sms:   'bg-[#F3E8FF] text-[#7C3AED]',
    };
    return map[channel] ?? 'bg-[#F3F4F6] text-[#51575B]';
  }
}