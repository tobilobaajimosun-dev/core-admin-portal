import { Injectable, signal, inject } from '@angular/core';
import { WalletService } from '@core/services/wallet.service';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';
import {
  WalletRaw,
  TopFundedWallet,
  WalletDateRange,
  WalletStatus,
  WalletMetricsData,
  WalletExportParams,
  WalletListParams,
  WalletDetailData,
  WalletDetailResponse,
  WalletAdjustParams,
} from '@core/interfaces/wallet.model';

export interface FetchWalletsParams {
  page:    number;
  limit:   number;
  status?: WalletStatus | string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class WalletStore {
  private readonly walletService = inject(WalletService);
  private readonly toast         = inject(PsToastService);

  // ── Wallets state ──────────────────────────────────────────────────────────
  private readonly _wallets          = signal<WalletRaw[]>([]);
  private readonly _topFundedWallets = signal<TopFundedWallet[]>([]);
  private readonly _isLoading        = signal(false);
  private readonly _currentPage      = signal(1);
  private readonly _currentLimit     = signal(5);
  private readonly _totalItems       = signal(0);

  // ── Wallet detail state ─────────────────────────────────────────────────────
  private readonly _walletDetail      = signal<WalletDetailData | null>(null);
  private readonly _isLoadingDetail   = signal(false);
  private readonly _walletDetailError = signal<string | null>(null);

  // ── Metrics state ──────────────────────────────────────────────────────────
  private readonly _metrics        = signal<WalletMetricsData | null>(null);
  private readonly _metricsLoading = signal(false);
  private readonly _metricsError   = signal<string | null>(null);

  private readonly _isExporting = signal(false);
  private readonly _exportError = signal<string | null>(null);
  isExporting = this._isExporting.asReadonly();
  exportError = this._exportError.asReadonly();

  // ── Adjust balance / status state ────────────────────────────────────────────
  private readonly _isAdjustingBalance = signal(false);
  private readonly _adjustBalanceError = signal<string | null>(null);
  private readonly _isUpdatingStatus   = signal(false);
  private readonly _updateStatusError  = signal<string | null>(null);

  isAdjustingBalance = this._isAdjustingBalance.asReadonly();
  adjustBalanceError = this._adjustBalanceError.asReadonly();
  isUpdatingStatus   = this._isUpdatingStatus.asReadonly();
  updateStatusError  = this._updateStatusError.asReadonly();

  // ── Public selectors ───────────────────────────────────────────────────────
  wallets          = this._wallets.asReadonly();
  topFundedWallets = this._topFundedWallets.asReadonly();
  isLoading        = this._isLoading.asReadonly();
  currentPage      = this._currentPage.asReadonly();
  currentLimit     = this._currentLimit.asReadonly();
  totalItems       = this._totalItems.asReadonly();

  metrics        = this._metrics.asReadonly();
  metricsLoading = this._metricsLoading.asReadonly();
  metricsError   = this._metricsError.asReadonly();

  walletDetail      = this._walletDetail.asReadonly();
  isLoadingDetail   = this._isLoadingDetail.asReadonly();
  walletDetailError = this._walletDetailError.asReadonly();


  private readonly _listConfig = signal<WalletListParams>({ page: 1, limit: 10 });
  private readonly _totalPages = signal(0);
  private readonly _error      = signal<string | null>(null);

  listConfig = this._listConfig.asReadonly();
  totalPages = this._totalPages.asReadonly();
  error      = this._error.asReadonly();

  // ── Actions ────────────────────────────────────────────────────────────────

fetchWallets(params: WalletListParams): void {
  this._isLoading.set(true);
  this._error.set(null);
  this._listConfig.set(params);
  this._currentPage.set(params.page ?? 1);
  this._currentLimit.set(params.limit ?? 10);

  this.walletService.getWallets(params).subscribe({
    next: (res) => {
      this._wallets.set(res.data.data);
      this._totalItems.set(res.data.meta.total);
      this._totalPages.set(res.data.meta.totalPages);
      this._isLoading.set(false);
    },
    error: (err: any) => {
      this._error.set(err?.error?.message ?? 'Failed to load wallets.');
      this._isLoading.set(false);
    },
  });
}

  fetchMetrics(): void {
    this._metricsLoading.set(true);
    this._metricsError.set(null);

    this.walletService.getWalletMetrics().subscribe({
      next: (res) => {
        this._metrics.set(res.data);
        this._metricsLoading.set(false);
      },
      error: (err) => {
        this._metricsError.set(err?.error?.message ?? 'Failed to load wallet metrics');
        this._metricsLoading.set(false);
      },
    });
  }

  exportWallets(params?: WalletExportParams): void {
  this._isExporting.set(true);
  this._exportError.set(null);

  const exportParams: WalletExportParams = params ?? {
    page: this._currentPage(),
    limit: this._currentLimit(),
  };

  this.walletService.exportWallets(exportParams).subscribe({
    next: (response) => {
      const blob = response.body;
      if (!blob) {
        this._isExporting.set(false);
        this._exportError.set('Export failed: empty response.');
        return;
      }

      const disposition = response.headers.get('content-disposition');
      const match = disposition?.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? `wallets_export_${Date.now()}.csv`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      this._isExporting.set(false);
    },
    error: (err: any) => {
      this._isExporting.set(false);
      this._exportError.set(err?.error?.message ?? 'Failed to export wallets.');
    },
  });
}

fetchWalletById(id: string): void {
  this._isLoadingDetail.set(true);
  this._walletDetailError.set(null);

  this.walletService.getWalletById(id).subscribe({
    next: (res) => {
      this._walletDetail.set(res.data);
      this._isLoadingDetail.set(false);
    },
    error: (err: any) => {
      this._walletDetailError.set(err?.error?.message ?? 'Failed to load wallet details.');
      this._isLoadingDetail.set(false);
    },
  });
}

adjustWalletBalance(id: string, params: WalletAdjustParams, onSuccess?: () => void): void {
  this._isAdjustingBalance.set(true);
  this._adjustBalanceError.set(null);

  this.walletService.adjustWalletBalance(id, params).subscribe({
    next: (res) => {
      const { wallet, transaction } = res.data;
      const current = this._walletDetail();
      if (current) {
        this._walletDetail.set({
          ...current,
          wallet: { ...current.wallet, ...wallet },
          recent_transactions: [transaction, ...current.recent_transactions],
        });
      }
      this._isAdjustingBalance.set(false);
      this.toast.success('Wallet balance updated successfully.');
      onSuccess?.();
    },
    error: (err: any) => {
      const message = err?.error?.message ?? 'Failed to update wallet balance.';
      this._adjustBalanceError.set(message);
      this._isAdjustingBalance.set(false);
      this.toast.error(message);
    },
  });
}

updateWalletStatus(id: string, status: WalletStatus, onSuccess?: () => void): void {
  this._isUpdatingStatus.set(true);
  this._updateStatusError.set(null);

  this.walletService.updateWalletStatus(id, { status }).subscribe({
    next: (res) => {
      const current = this._walletDetail();
      if (current) {
        this._walletDetail.set({
          ...current,
          wallet: { ...current.wallet, ...res.data },
        });
      }
      this._isUpdatingStatus.set(false);
      this.toast.success(
        status === 'FROZEN' ? 'Wallet frozen successfully.' : 'Wallet unfrozen successfully.'
      );
      onSuccess?.();
    },
    error: (err: any) => {
      const message = err?.error?.message ?? 'Failed to update wallet status.';
      this._updateStatusError.set(message);
      this._isUpdatingStatus.set(false);
      this.toast.error(message);
    },
  });
}

fetchTopFundedWallets(): void {}

 setSearch(query: string): void {
  this.fetchWallets({ ...this._listConfig(), search: query || undefined, page: 1 });
 }

setPage(page: number): void {
  this.fetchWallets({ ...this._listConfig(), page });
}

setPageSize(size: number): void {
  this.fetchWallets({ ...this._listConfig(), limit: size, page: 1 });
}

setTimeframe(range: WalletDateRange): void {
  this.fetchWallets({ ...this._listConfig(), custom_range: range, start_date: undefined, end_date: undefined, page: 1 });
}
}