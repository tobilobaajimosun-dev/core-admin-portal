import { HttpContext } from '@angular/common/http';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { VendorService } from '../shared/services/vendor.service';
import { SKIP_LOADER } from '@core/interceptors/token';
import { HugeiconsIconComponent, IconSvgObject } from '@hugeicons/angular';
import {
  Store01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  UserBlock01Icon,
  UserAdd01Icon,
  MoneyAdd01Icon,
  ReceiptTextIcon,
  Wallet01Icon,
  CancelCircleIcon,
  Calendar01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from '@hugeicons-pro/core-stroke-rounded';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { InfoBannerComponent } from '@pages/asset-flex/shared/components/info-banner/info-banner.component';
import { NairaPipe } from '../shared/pipes/naira.pipe';
import { FiltersComponent, FilterSection } from '@pages/asset-flex/shared/components/filters/filters.component';

interface MonthBar {
  label: string;
  value: number;
  /** 0-100, pre-computed against the series max so the template stays pure. */
  heightPct: number;
}

interface StatusSlice {
  label: string;
  value: number;
  pct: number;
  color: string;
}

interface VendorLeader {
  name: string;
  amount: number;
  pct: number;
}

interface StatCard {
  key: string;
  label: string;
  value: string;
  hint: string;
  icon: IconSvgObject;
  accent: string;
  /** When set, the card links here (e.g. the pending-KYB queue). */
  route?: string;
  queryParams?: Record<string, string>;
}

interface QuickAction {
  label: string;
  icon: IconSvgObject;
  route: string;
  queryParams?: Record<string, string>;
  primary?: boolean;
}

interface PendingSettlementRow {
  customer: string;
  vendor: string;
  item: string;
  amount: number;
  dueDate: string;
}

interface FailedPaymentRow {
  customer: string;
  vendor: string;
  amount: number;
  reason: string;
  date: string;
}

interface MoneyMovementParty {
  name: string;
  amount: number;
}

interface MoneyMovementMonth {
  label: string;
  moneyIn: number;
  moneyOut: number;
  topSources: MoneyMovementParty[];
  topSpend: MoneyMovementParty[];
}

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    HugeiconsIconComponent,
    RouterLink,
    NgTemplateOutlet,
    ErrorStateComponent,
    InfoBannerComponent,
    NairaPipe,
    FiltersComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly vendorService = inject(VendorService);

  // ── Quick actions ──────────────────────────────────────────────────────
  protected readonly quickActions: QuickAction[] = [
    { label: 'Onboard vendor', icon: UserAdd01Icon, route: '/asset-flex/vendors', primary: true },
    { label: 'Create loan product', icon: MoneyAdd01Icon, route: '/asset-flex/loan-products' },
    {
      label: 'Review pending settlements',
      icon: ReceiptTextIcon,
      route: '/asset-flex/settlements',
      queryParams: { status: 'PENDING' },
    },
    { label: 'Add payment method', icon: Wallet01Icon, route: '/asset-flex/payment-methods' },
  ];

  // ── Pending settlements table (sample) ─────────────────────────────────
  protected readonly pendingSettlements: PendingSettlementRow[] = [
    { customer: 'Ifeoma Chukwu', vendor: 'Northgate Retail', item: 'Samsung 55" Smart TV', amount: 420_000, dueDate: '2026-08-14' },
    { customer: 'Tunde Bakare', vendor: 'Everstone Motors', item: 'Toyota Corolla — service plan', amount: 1_850_000, dueDate: '2026-08-15' },
    { customer: 'Amaka Obi', vendor: 'Palm Court Appliances', item: 'LG Washing Machine', amount: 265_000, dueDate: '2026-08-15' },
    { customer: 'David Eze', vendor: 'Bluewave Electronics', item: 'iPhone 15 Pro', amount: 980_000, dueDate: '2026-08-16' },
    { customer: 'Grace Adeyemi', vendor: 'Aro Fashion House', item: 'Designer wardrobe bundle', amount: 145_000, dueDate: '2026-08-17' },
  ];

  // ── Gross payout volume + day filter ───────────────────────────────────
  protected readonly payoutIcon = Calendar01Icon;
  protected readonly payoutFrom = signal('');
  protected readonly payoutTo = signal('');
  /** Deterministic per selected range so the number doesn't jitter on every
   * change-detection pass — a real integration would fetch this from the
   * (not-yet-built) reports endpoint instead. */
  protected readonly grossPayoutVolume = computed(() => {
    const span = this.rangeSpanDays(this.payoutFrom(), this.payoutTo());
    return Math.round(820_000 * span * (1 + (span % 3) * 0.08));
  });

  protected payoutFilterSections(): FilterSection[] {
    return [
      { key: 'range', label: 'Period', icon: this.payoutIcon, kind: 'date-range', from: this.payoutFrom(), to: this.payoutTo() },
    ];
  }

  protected onPayoutRangeChange(event: { key: string; from: string; to: string }): void {
    if (event.key !== 'range') return;
    this.payoutFrom.set(event.from);
    this.payoutTo.set(event.to);
  }

  private rangeSpanDays(from: string, to: string): number {
    if (!from && !to) return 30;
    if (from && to) {
      const days = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000) + 1;
      return Math.max(1, days);
    }
    return 1;
  }

  // ── Failed payments / top customers / top categories (sample) ─────────
  protected readonly failedIcon = CancelCircleIcon;
  protected readonly failedPayments: FailedPaymentRow[] = [
    { customer: 'Kelechi Nwosu', vendor: 'Bluewave Electronics', amount: 210_000, reason: 'Insufficient funds', date: '2026-08-11' },
    { customer: 'Bisi Fashola', vendor: 'Northgate Retail', amount: 95_000, reason: 'Card declined', date: '2026-08-10' },
    { customer: 'Emeka Okoro', vendor: 'Aro Fashion House', amount: 58_000, reason: 'Mandate not authorized', date: '2026-08-09' },
  ];

  protected readonly topCustomers: VendorLeader[] = (() => {
    const raw = [
      { name: 'Ifeoma Chukwu', amount: 2_140_000 },
      { name: 'Tunde Bakare', amount: 1_850_000 },
      { name: 'David Eze', amount: 1_320_000 },
      { name: 'Amaka Obi', amount: 890_000 },
      { name: 'Grace Adeyemi', amount: 610_000 },
    ];
    const max = Math.max(...raw.map((v) => v.amount));
    return raw.map((v) => ({ ...v, pct: Math.round((v.amount / max) * 100) }));
  })();

  /** No "item category" field exists anywhere in the API — approximated from
   * the top vendors' own line of business instead, per the actual product ask. */
  protected readonly topCategories: VendorLeader[] = (() => {
    const raw = [
      { name: 'Electronics & Appliances', amount: 15_900_000 },
      { name: 'Automotive', amount: 14_200_000 },
      { name: 'Fashion & Apparel', amount: 6_650_000 },
      { name: 'Furniture', amount: 4_100_000 },
      { name: 'Education', amount: 2_300_000 },
    ];
    const max = Math.max(...raw.map((v) => v.amount));
    return raw.map((v) => ({ ...v, pct: Math.round((v.amount / max) * 100) }));
  })();

  // ── Money movement (Mercury-style, sample) ─────────────────────────────
  protected readonly backIcon = ArrowLeft01Icon;
  protected readonly nextIcon = ArrowRight01Icon;
  protected readonly moneyMovementIcon = Calendar01Icon;
  protected readonly monthOffset = signal(0);
  protected readonly moneyMovementFrom = signal('');
  protected readonly moneyMovementTo = signal('');

  private readonly moneyMovementSeries: MoneyMovementMonth[] = [
    {
      label: 'Aug 2026',
      moneyIn: 6_318_385,
      moneyOut: 3_547_727,
      topSources: [
        { name: 'Ifeoma Chukwu', amount: 2_140_000 },
        { name: 'Tunde Bakare', amount: 1_850_000 },
        { name: 'David Eze', amount: 1_320_000 },
      ],
      topSpend: [
        { name: 'Northgate Retail', amount: 1_840_000 },
        { name: 'Everstone Motors', amount: 1_420_000 },
        { name: 'Palm Court Appliances', amount: 980_000 },
      ],
    },
    {
      label: 'Jul 2026',
      moneyIn: 7_450_000,
      moneyOut: 4_180_500,
      topSources: [
        { name: 'Amaka Obi', amount: 1_780_000 },
        { name: 'Grace Adeyemi', amount: 1_240_000 },
        { name: 'Ifeoma Chukwu', amount: 990_000 },
      ],
      topSpend: [
        { name: 'Everstone Motors', amount: 2_010_000 },
        { name: 'Northgate Retail', amount: 1_260_000 },
        { name: 'Bluewave Electronics', amount: 730_000 },
      ],
    },
    {
      label: 'Jun 2026',
      moneyIn: 5_930_000,
      moneyOut: 3_120_000,
      topSources: [
        { name: 'David Eze', amount: 1_510_000 },
        { name: 'Tunde Bakare', amount: 1_105_000 },
        { name: 'Bisi Fashola', amount: 640_000 },
      ],
      topSpend: [
        { name: 'Palm Court Appliances', amount: 1_180_000 },
        { name: 'Aro Fashion House', amount: 890_000 },
        { name: 'Northgate Retail', amount: 610_000 },
      ],
    },
  ];

  protected readonly currentMonth = computed(
    () => this.moneyMovementSeries[this.monthOffset()] ?? this.moneyMovementSeries[0],
  );

  protected readonly avgLast3In = computed(() => {
    const vals = this.moneyMovementSeries.slice(0, 3).map((m) => m.moneyIn);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  });

  protected readonly avgLast3Out = computed(() => {
    const vals = this.moneyMovementSeries.slice(0, 3).map((m) => m.moneyOut);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  });

  protected canGoNextMonth(): boolean {
    return this.monthOffset() > 0;
  }

  protected canGoPrevMonth(): boolean {
    return this.monthOffset() < this.moneyMovementSeries.length - 1;
  }

  protected goPrevMonth(): void {
    if (this.canGoPrevMonth()) this.monthOffset.update((n) => n + 1);
  }

  protected goNextMonth(): void {
    if (this.canGoNextMonth()) this.monthOffset.update((n) => n - 1);
  }

  protected moneyMovementFilterSections(): FilterSection[] {
    return [
      {
        key: 'period',
        label: 'Custom period',
        icon: this.moneyMovementIcon,
        kind: 'date-range',
        from: this.moneyMovementFrom(),
        to: this.moneyMovementTo(),
      },
    ];
  }

  protected onMoneyMovementRangeChange(event: { key: string; from: string; to: string }): void {
    if (event.key !== 'period') return;
    this.moneyMovementFrom.set(event.from);
    this.moneyMovementTo.set(event.to);
  }

  /**
   * Sample data for the Reports preview below — the Asset Flex API has no
   * reporting/analytics endpoint yet (checked the live Swagger spec directly,
   * nothing under /admin/reports or similar). This block exists to show what
   * a reports section could look like once that backend work lands; it is
   * never fetched and never presented as real.
   */
  private readonly sampleLoanVolume = [
    { label: 'Mar', value: 4_200_000 },
    { label: 'Apr', value: 5_100_000 },
    { label: 'May', value: 4_800_000 },
    { label: 'Jun', value: 6_300_000 },
    { label: 'Jul', value: 7_450_000 },
    { label: 'Aug', value: 6_900_000 },
  ];

  protected readonly loanVolumeBars: MonthBar[] = (() => {
    const max = Math.max(...this.sampleLoanVolume.map((m) => m.value));
    return this.sampleLoanVolume.map((m) => ({ ...m, heightPct: Math.round((m.value / max) * 100) }));
  })();

  protected readonly loanStatusBreakdown: StatusSlice[] = (() => {
    const raw: Omit<StatusSlice, 'pct'>[] = [
      { label: 'Active', value: 412, color: '#00b3ff' },
      { label: 'Paid off', value: 268, color: '#16a34a' },
      { label: 'Overdue', value: 34, color: '#dc2626' },
      { label: 'Pending disbursement', value: 19, color: '#b45309' },
    ];
    const total = raw.reduce((sum, s) => sum + s.value, 0);
    return raw.map((s) => ({ ...s, pct: Math.round((s.value / total) * 1000) / 10 }));
  })();

  protected readonly topVendors: VendorLeader[] = (() => {
    const raw = [
      { name: 'Northgate Retail', amount: 18_400_000 },
      { name: 'Everstone Motors', amount: 14_200_000 },
      { name: 'Palm Court Appliances', amount: 9_800_000 },
      { name: 'Bluewave Electronics', amount: 7_100_000 },
      { name: 'Aro Fashion House', amount: 5_650_000 },
    ];
    const max = Math.max(...raw.map((v) => v.amount));
    return raw.map((v) => ({ ...v, pct: Math.round((v.amount / max) * 100) }));
  })();

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly stats = signal<StatCard[]>([
    { key: 'total', label: 'Total vendors', value: '—', hint: 'All registered', icon: Store01Icon, accent: '#00b3ff' },
    {
      key: 'pending',
      label: 'Pending KYB',
      value: '—',
      hint: 'Awaiting review',
      icon: Clock01Icon,
      accent: '#b45309',
      route: '/asset-flex/vendors',
      queryParams: { status: 'PENDING_APPROVAL' },
    },
    { key: 'approved', label: 'Approved', value: '—', hint: 'Active vendors', icon: CheckmarkCircle02Icon, accent: '#16a34a' },
    { key: 'blacklisted', label: 'Blacklisted', value: '—', hint: 'Suspended access', icon: UserBlock01Icon, accent: '#dc2626' },
  ]);

  constructor() {
    this.loadSummary();
  }

  protected retry(): void {
    this.loadSummary();
  }

  private loadSummary(): void {
    // Background fetch — suppress the global loader; the cards show their own skeleton state.
    const silent = new HttpContext().set(SKIP_LOADER, true);
    this.loading.set(true);
    this.error.set(false);
    forkJoin({
      total: this.vendorService.list({ page: 1, limit: 1 }, silent),
      pending: this.vendorService.list({ page: 1, limit: 1, status: 'PENDING_APPROVAL' }, silent),
      approved: this.vendorService.list({ page: 1, limit: 1, status: 'APPROVED' }, silent),
      blacklisted: this.vendorService.list({ page: 1, limit: 1, status: 'BLACKLISTED' }, silent),
    }).subscribe({
      next: (res) => {
        const counts: Record<string, number> = {
          total: res.total.data?.pagination?.total ?? 0,
          pending: res.pending.data?.pagination?.total ?? 0,
          approved: res.approved.data?.pagination?.total ?? 0,
          blacklisted: res.blacklisted.data?.pagination?.total ?? 0,
        };
        this.stats.update((cards) => cards.map((c) => ({ ...c, value: String(counts[c.key] ?? 0) })));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
