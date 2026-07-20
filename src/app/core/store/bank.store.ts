import { Injectable, signal, computed, inject } from '@angular/core';
import { BankService } from '@core/services/bank.service';
import { BankRaw } from '@core/interfaces/bank.model';

@Injectable({ providedIn: 'root' })
export class BankStore {
  private readonly bankService = inject(BankService);

  // ── Raw state ─────────────────────────────────────────────────────────────
  private readonly _banks = signal<BankRaw[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _loaded = signal(false); // guards against refetching on every open

  // ── Public selectors ─────────────────────────────────────────────────────
  readonly banks = computed(() => this._banks());
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());
  readonly loaded = computed(() => this._loaded());

  readonly bankOptions = computed(() =>
    this._banks().map(b => ({ label: b.name, value: b.id }))
  );

  // ── Actions ───────────────────────────────────────────────────────────────
  fetchBanks(force = false): void {
    if (this._loaded() && !force) return; 

    this._isLoading.set(true);
    this._error.set(null);

    this.bankService.getBanks().subscribe({
      next: (res) => {
        this._banks.set(res.data);
        this._isLoading.set(false);
        this._loaded.set(true);
      },
      error: (err) => {
        this._error.set(err?.error?.message ?? 'Failed to load banks');
        this._isLoading.set(false);
      },
    });
  }
}