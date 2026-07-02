import { Injectable, signal, inject } from '@angular/core';
import { WalletService } from '@core/services/wallet.service';
import {
  WalletRaw,
  TopFundedWallet,
  WalletDateRange,
  WalletStatus,
  WalletMetricsData,
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

  // ── Wallets state ──────────────────────────────────────────────────────────
  private readonly _wallets          = signal<WalletRaw[]>([]);
  private readonly _topFundedWallets = signal<TopFundedWallet[]>([]);
  private readonly _isLoading        = signal(false);
  private readonly _currentPage      = signal(1);
  private readonly _currentLimit     = signal(5);
  private readonly _totalItems       = signal(0);

  // ── Metrics state ──────────────────────────────────────────────────────────
  private readonly _metrics        = signal<WalletMetricsData | null>(null);
  private readonly _metricsLoading = signal(false);
  private readonly _metricsError   = signal<string | null>(null);

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

  // ── Actions ────────────────────────────────────────────────────────────────

  fetchWallets(params: FetchWalletsParams): void {
    this._currentPage.set(params.page);
    this._currentLimit.set(params.limit);
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

  fetchTopFundedWallets(): void {}

  setSearch(query: string): void {
    this.fetchWallets({ page: 1, limit: this._currentLimit(), search: query || undefined });
  }

  setPage(page: number): void {
    this.fetchWallets({ page, limit: this._currentLimit() });
  }

  setPageSize(size: number): void {
    this.fetchWallets({ page: 1, limit: size });
  }

  setTimeframe(range: WalletDateRange): void {
    this.fetchWallets({ page: 1, limit: this._currentLimit() });
  }
}