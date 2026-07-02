import { Injectable, signal, computed, inject } from '@angular/core';
import { TransactionService } from '@core/services/transaction.service';
import {
  TransactionRaw,
  TransactionListParams,
  TransactionDateRange,
  TransactionDetailRaw,
  TransactionMetricsData,
} from '@core/interfaces/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionStore {
  private readonly transactionService = inject(TransactionService);

  // ── Raw state ─────────────────────────────────────────────────────────────
  private readonly _transactions = signal<TransactionRaw[]>([]);
  private readonly _total        = signal(0);
  private readonly _page         = signal(1);
  private readonly _limit        = signal(10);
  private readonly _isLoading    = signal(false);
  private readonly _error        = signal<string | null>(null);

  private readonly _selectedTransaction = signal<TransactionDetailRaw | null>(null);
  private readonly _isLoadingDetail     = signal(false);
  private readonly _detailError         = signal<string | null>(null);

  // ── Metrics state ─────────────────────────────────────────────────────────
  private readonly _metrics        = signal<TransactionMetricsData | null>(null);
  private readonly _metricsLoading = signal(false);
  private readonly _metricsError   = signal<string | null>(null);

  // ── Filter state ──────────────────────────────────────────────────────────
  private readonly _search   = signal('');
  private readonly _type     = signal('');
  private readonly _category = signal('');
  private readonly _status   = signal('');
  private readonly _range    = signal<TransactionDateRange | ''>('');

  // ── Public selectors ──────────────────────────────────────────────────────
  readonly transactions = computed(() => this._transactions());
  readonly total        = computed(() => this._total());
  readonly currentPage  = computed(() => this._page());
  readonly currentLimit = computed(() => this._limit());
  readonly isLoading    = computed(() => this._isLoading());
  readonly error        = computed(() => this._error());

  readonly selectedTransaction = computed(() => this._selectedTransaction());
  readonly isLoadingDetail     = computed(() => this._isLoadingDetail());
  readonly detailError         = computed(() => this._detailError());

  readonly metrics        = computed(() => this._metrics());
  readonly metricsLoading = computed(() => this._metricsLoading());
  readonly metricsError   = computed(() => this._metricsError());

  // ── Actions ───────────────────────────────────────────────────────────────

  fetchTransactions(params: TransactionListParams = {}): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.transactionService.getTransactions(params).subscribe({
      next: (res) => {
        this._transactions.set(res.data.data);
        this._total.set(res.data.meta.total);
        this._page.set(res.data.meta.page);
        this._limit.set(res.data.meta.limit);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err?.error?.message ?? 'Failed to load transactions');
        this._isLoading.set(false);
      },
    });
  }

  fetchTransactionById(id: string): void {
    this._isLoadingDetail.set(true);
    this._detailError.set(null);

    this.transactionService.getTransactionById(id).subscribe({
      next: (res) => {
        this._selectedTransaction.set(res.data);
        this._isLoadingDetail.set(false);
      },
      error: (err) => {
        this._detailError.set(err?.error?.message ?? 'Failed to load transaction');
        this._isLoadingDetail.set(false);
      },
    });
  }

  fetchMetrics(): void {
    this._metricsLoading.set(true);
    this._metricsError.set(null);

    this.transactionService.getTransactionMetrics().subscribe({
      next: (res) => {
        this._metrics.set(res.data);
        this._metricsLoading.set(false);
      },
      error: (err) => {
        this._metricsError.set(err?.error?.message ?? 'Failed to load transaction metrics');
        this._metricsLoading.set(false);
      },
    });
  }

  setSearch(query: string): void {
    this._search.set(query);
    this.fetchTransactions({ page: 1, limit: this._limit(), search: query });
  }

  setTimeframe(range: TransactionDateRange): void {
    this._range.set(range);
    this.fetchTransactions({ page: 1, limit: this._limit(), custom_range: range });
  }

  setPage(page: number):      void { this.fetchTransactions({ page, limit: this._limit() }); }
  setPageSize(limit: number): void { this.fetchTransactions({ page: 1, limit }); }
}