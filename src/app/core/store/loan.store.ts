import { Injectable, signal, computed, inject } from '@angular/core';
import { LoanService } from '@core/services/loan.service';
import {
  LoanRaw,
  LoanView,
  LoanListParams,
  LoanDateRange,
} from '@core/interfaces/loan.model';

const STATUS_LABELS: Record<string, string> = {
  NEW:       'New',
  COMPLETED: 'Completed',
  FAILED:    'Failed',
  CANCELLED: 'Cancelled',
  ACTIVE:    'Active',
  PENDING:   'Pending',
};

function toLoanView(raw: LoanRaw): LoanView {
  const createdAt = new Date(raw.createdAt);

  return {
    id:              raw.id,
    applicationDate: createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ',',
    applicationTime: createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }) + ' GMT',
    customerName:    `${raw.customer.firstName} ${raw.customer.lastName}`,
    customerEmail:   raw.customer.email,
    initials:         `${(raw.customer.firstName ?? ' ').charAt(0)}${(raw.customer.lastName ?? ' ').charAt(0)}`.toUpperCase(),
    loanId:          raw.unique_loan_id,
    amount:          `₦${raw.loan_amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
    tenor:           `For ${raw.loan_duration} month${raw.loan_duration === 1 ? '' : 's'}`,
    product:         raw.product.title,
    status:          STATUS_LABELS[raw.status] ?? raw.status,
  };
}

@Injectable({ providedIn: 'root' })
export class LoanStore {
  private readonly loanService = inject(LoanService);

  // ── Raw state ─────────────────────────────────────────────────────────────
  private readonly _loans     = signal<LoanRaw[]>([]);
  private readonly _total     = signal(0);
  private readonly _page      = signal(1);
  private readonly _limit     = signal(10);
  private readonly _isLoading = signal(false);
  private readonly _error     = signal<string | null>(null);

  // ── Filter state ──────────────────────────────────────────────────────────
  private readonly _search    = signal('');
  private readonly _status    = signal('');
  private readonly _range     = signal<LoanDateRange | ''>('');
  private readonly _tenor     = signal('');
  private readonly _product   = signal('');
  private readonly _minAmount = signal<number | null>(null);
  private readonly _maxAmount = signal<number | null>(null);

  // ── Public selectors ──────────────────────────────────────────────────────
  readonly loans       = computed(() => this._loans());
  readonly loanViews   = computed(() => this._loans().map(toLoanView));
  readonly total       = computed(() => this._total());
  readonly currentPage = computed(() => this._page());
  readonly currentLimit = computed(() => this._limit());
  readonly isLoading   = computed(() => this._isLoading());
  readonly error       = computed(() => this._error());

  // ── Actions ───────────────────────────────────────────────────────────────

  fetchLoans(params: LoanListParams = {}): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.loanService.getLoans(params).subscribe({
      next: (res) => {
        this._loans.set(res.data.data);
        this._total.set(res.data.meta.total);
        this._page.set(res.data.meta.page);
        this._limit.set(res.data.meta.limit);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err?.error?.message ?? 'Failed to load loans');
        this._isLoading.set(false);
      },
    });
  }

  setSearch(query: string): void {
    this._search.set(query);
    this.fetchLoans({ page: 1, limit: this._limit(), search: query });
  }

  setTimeframe(range: LoanDateRange): void {
    this._range.set(range);
    this.fetchLoans({ page: 1, limit: this._limit(), custom_range: range });
  }

  setStatus(status: string): void {
    this._status.set(status);
    this.fetchLoans({ page: 1, limit: this._limit(), status: status || undefined });
  }

  setTenor(tenor: string): void {
    this._tenor.set(tenor);
    this.fetchLoans({ page: 1, limit: this._limit(), tenor: tenor || undefined });
  }

  setProduct(product: string): void {
    this._product.set(product);
    this.fetchLoans({ page: 1, limit: this._limit(), product: product || undefined });
  }

  setAmountRange(minAmount: number | null, maxAmount: number | null): void {
    this._minAmount.set(minAmount);
    this._maxAmount.set(maxAmount);
    this.fetchLoans({
      page: 1,
      limit: this._limit(),
      min_amount: minAmount ?? undefined,
      max_amount: maxAmount ?? undefined,
    });
  }

  setPage(page: number):      void { this.fetchLoans({ page, limit: this._limit() }); }
  setPageSize(limit: number): void { this.fetchLoans({ page: 1, limit }); }
}