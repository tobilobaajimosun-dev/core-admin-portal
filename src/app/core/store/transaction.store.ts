import { Injectable, signal, computed, inject } from '@angular/core';
import { TransactionService } from '@core/services/transaction.service';
import {
  TransactionRaw,
  TransactionListParams,
  TransactionDateRange,
  TransactionDetailRaw,
  TransactionMetricsData,
} from '@core/interfaces/transaction.model';

function extractFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;
  const match = contentDisposition.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? null;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

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

  // ── Export state ─────────────────────────────────────────────────────────
private readonly _isExporting = signal(false);
private readonly _exportError = signal<string | null>(null);
readonly isExporting = computed(() => this._isExporting());
readonly exportError = computed(() => this._exportError());

// ── Receipt download state ─────────────────────────────────────────────
private readonly _isDownloadingReceipt = signal(false);
private readonly _receiptError         = signal<string | null>(null);
readonly isDownloadingReceipt = computed(() => this._isDownloadingReceipt());
readonly receiptError         = computed(() => this._receiptError());

// ── Retry state ─────────────────────────────────────────────────────────
private readonly _isRetrying = signal(false);
private readonly _retryError = signal<string | null>(null);
readonly isRetrying = computed(() => this._isRetrying());
readonly retryError = computed(() => this._retryError());

// ── Refund state ────────────────────────────────────────────────────────
private readonly _isRefunding = signal(false);
private readonly _refundError = signal<string | null>(null);
readonly isRefunding = computed(() => this._isRefunding());
readonly refundError = computed(() => this._refundError());


// Track the last params used to fetch the list, so export can reuse
// the active filters/search without page & limit.
private readonly _lastParams = signal<TransactionListParams>({ page: 1, limit: 10 });

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
    this._lastParams.set(params);
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

  exportTransactions(): void {
  this._isExporting.set(true);
  this._exportError.set(null);

  // Export the currently filtered/searched result set — page/limit
  // aren't relevant since export returns everything matching.
  const { page, limit, ...filters } = this._lastParams();

  this.transactionService.getTransactionExport(filters).subscribe({
    next: (response) => {
      this._isExporting.set(false);
      const blob = response.body as Blob;
      const filename =
        extractFilename(response.headers.get('content-disposition')) ??
        `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      downloadBlob(blob, filename);
    },
    error: (err) => {
      this._isExporting.set(false);
      const fallback = 'Failed to export transactions.';

      if (err?.error instanceof Blob) {
        err.error.text().then((text: string) => {
          let message = fallback;
          try {
            message = JSON.parse(text)?.message ?? fallback;
          } catch {
            /* not JSON, use fallback */
          }
          this._exportError.set(message);
        });
      } else {
        this._exportError.set(err?.error?.message ?? fallback);
      }
    },
  });
}

downloadReceipt(id: string): void {
  this._isDownloadingReceipt.set(true);
  this._receiptError.set(null);

  this.transactionService.getTransactionReceipt(id).subscribe({
    next: (response) => {
      this._isDownloadingReceipt.set(false);
      const blob = response.body as Blob;
      const filename =
        extractFilename(response.headers.get('content-disposition')) ??
        `receipt_${id}.pdf`;
      downloadBlob(blob, filename);
    },
    error: (err) => {
      this._isDownloadingReceipt.set(false);
      const fallback = 'Failed to download receipt.';

      if (err?.error instanceof Blob) {
        err.error.text().then((text: string) => {
          let message = fallback;
          try {
            message = JSON.parse(text)?.message ?? fallback;
          } catch {
            /* not JSON, use fallback */
          }
          this._receiptError.set(message);
        });
      } else {
        this._receiptError.set(err?.error?.message ?? fallback);
      }
    },
  });
}

retryTransaction(id: string): void {
  this._isRetrying.set(true);
  this._retryError.set(null);

  this.transactionService.retryTransaction(id).subscribe({
    next: () => {
      this._isRetrying.set(false);
      // Refresh the detail in case retry changed the status
      this.fetchTransactionById(id);
    },
    error: (err) => {
      this._isRetrying.set(false);
      this._retryError.set(err?.error?.message ?? 'Failed to retry transaction.');
    },
  });
}

refundTransaction(id: string): void {
  this._isRefunding.set(true);
  this._refundError.set(null);

  this.transactionService.refundTransaction(id).subscribe({
    next: () => {
      this._isRefunding.set(false);
      this.fetchTransactionById(id);
    },
    error: (err) => {
      this._isRefunding.set(false);
      this._refundError.set(err?.error?.message ?? 'Failed to refund transaction.');
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