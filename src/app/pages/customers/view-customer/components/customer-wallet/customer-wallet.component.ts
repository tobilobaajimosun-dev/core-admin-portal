import { Component, computed, inject, input, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CustomerStore } from '@core/store/customer.store';

@Component({
  selector: 'app-customer-wallet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-wallet.component.html',
})
export class CustomerWalletComponent implements OnInit {
  /** Customer ID passed in from the parent (detail page) */
  customerId = input.required<string>();

  private readonly store = inject(CustomerStore);

  readonly isLoading = this.store.isLoadingFinancialSummary;
  readonly error     = this.store.financialSummaryError;
  readonly summary   = this.store.financialSummary;

  // ── Derived rows ───────────────────────────────────────────────────────────

readonly walletRows = computed(() => {
  const wallet = this.summary()?.wallet_detail;
  if (!wallet) return [];
  return [
    { label: 'Wallet Creation Status', value: wallet.wallet_created_status ? 'Active' : 'Inactive', badge: true  },
    { label: 'Current Balance',        value: this.formatCurrency(wallet.current_balance),            badge: false },
    { label: 'Total Funded',           value: this.formatCurrency(wallet.funded),                     badge: false },
    { label: 'Total Spent',            value: this.formatCurrency(wallet.spent),                      badge: false },
  ];
});

readonly loanRows = computed(() => {
  const loan = this.summary()?.loans;
  if (!loan) return [];
  return [
    { label: 'Active Loan',    value: String(loan.active)              },
    { label: 'Total Borrowed', value: this.formatCurrency(loan.borrowed) },
    { label: 'Total Repaid',   value: this.formatCurrency(loan.repaid)   },
  ];
});

readonly vasSpend = computed(() => {
  const vas = this.summary()?.vas;
  return vas != null ? this.formatCurrency(vas) : '—';   
});

  ngOnInit(): void {
    this.store.fetchFinancialSummary(this.customerId());
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style:    'currency',
      currency: 'NGN',
      // Use the Naira sign (₦) instead of "NGN"
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}