import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WalletStore } from '@core/store/wallet.store';
import { TopFundedWallet } from '@core/interfaces/wallet.model';

@Component({
  selector: 'app-top-funded-wallets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-funded-wallets.component.html',
})
export class TopFundedWalletsComponent {
  readonly store = inject(WalletStore);
  private readonly router = inject(Router);

  isLoading     = signal(false);
  skeletonItems = new Array(4);

  wallets = computed(() => this.store.topFundedWallets());

  getInitials(f: string, l: string): string {
    return `${(f ?? ' ').charAt(0)}${(l ?? ' ').charAt(0)}`.toUpperCase();
  }

  formatAmount(amount: number): string {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  }

  viewWallet(wallet: TopFundedWallet): void {
    this.router.navigate(['/wallets', wallet.id]);
  }
}