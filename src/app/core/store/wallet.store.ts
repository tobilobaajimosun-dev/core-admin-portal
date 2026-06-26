import { Injectable, signal } from '@angular/core';
import { WalletRaw, TopFundedWallet, WalletDateRange, WalletStatus } from '@core/interfaces/wallet.model';
export interface FetchWalletsParams {
  page:   number;
  limit:  number;
  status?: WalletStatus | string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class WalletStore {
  private readonly _wallets         = signal<WalletRaw[]>([]);
  private readonly _topFundedWallets = signal<TopFundedWallet[]>([]);
  private readonly _isLoading       = signal(false);
  private readonly _currentPage     = signal(1);
  private readonly _currentLimit    = signal(5);
  private readonly _totalItems      = signal(0);

  wallets         = this._wallets.asReadonly();
  topFundedWallets = this._topFundedWallets.asReadonly();
  isLoading       = this._isLoading.asReadonly();
  currentPage     = this._currentPage.asReadonly();
  currentLimit    = this._currentLimit.asReadonly();
  totalItems      = this._totalItems.asReadonly();

  fetchWallets(params: FetchWalletsParams): void {
    this._currentPage.set(params.page);
    this._currentLimit.set(params.limit);
  }

  fetchTopFundedWallets(): void {
  }

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