import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe }         from '@angular/common';
import { Router, ActivatedRoute }                      from '@angular/router';
import { PsSvgIconComponent }  from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import {
  UpdateBalanceModalComponent,
  UpdateBalanceAction,
} from '@shared/components/modals/update-balance-modal/update-balance-modal.component';
import { FreezeWalletModalComponent } from '@shared/components/modals/freeze-wallet-modal/freeze-wallet-modal.component';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { WalletStore } from '@core/store/wallet.store';
import { WalletStatus, WalletTransactionDetail } from '@core/interfaces/wallet.model';

interface InfoRow {
  label:       string;
  value:       string;
  badge?:      boolean;
  badgeClass?: string;
}

@Component({
  selector: 'app-view-wallet',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    PsSvgIconComponent,
  ],
  templateUrl: './view-wallet.component.html',
})
export class ViewWalletComponent implements OnInit {
  private readonly router       = inject(Router);
  private readonly route        = inject(ActivatedRoute);
  private readonly modalService = inject(PsModalService);
  readonly store                = inject(WalletStore);

  revealPhone = false;

  isLoading = this.store.isLoadingDetail;

 wallet = computed(() => {
  const detail = this.store.walletDetail();
  if (!detail) return null;

  const { wallet, metrics, recent_transactions } = detail;

  return {
    walletId:         wallet.public_id,
    status:            this.formatStatus(wallet.status),   
    availableBalance:  wallet.available_balance,
    totalFunded:       metrics.total_funded,
    totalSpent:        metrics.total_spent,
    transactionsCount: metrics.transaction_count,
    dateCreated:       wallet.created_at,
    kyc:               wallet.customer.is_bvn_verified ? 'Verified' : 'Unverified',
    accountTier:       '—',
    lastFunded:        metrics.last_funded_date,
    lastActivity:      wallet.updated_at,
    restrictions:      'None',
    customer: {
      id:        wallet.customer.id,
      firstName: wallet.customer.firstName,
      lastName:  wallet.customer.lastName,
      email:     wallet.customer.email,
      phone:     wallet.customer.phone,
      avatarUrl: wallet.customer.profile_image,
    },
    walletAccount: {
      bankName:      wallet.bank_name,
      accountNumber: wallet.account_number,
      accountName:   wallet.account_name,
    },
    recentTransactions: recent_transactions as WalletTransactionDetail[],
  };
});

private formatStatus(status?: WalletStatus): string {
  switch (status) {
    case 'ACTIVE':   return 'Active';
    case 'FROZEN':   return 'Frozen';
    case 'INACTIVE': return 'Inactive';
    default:         return 'Active';
  }
}
  infoRows = computed((): InfoRow[] => {
    const wallet = this.wallet();
    if (!wallet) return [];

    return [
      { label: 'Wallet ID', value: wallet.walletId },
      {
        label:      'Wallet Status',
        value:      wallet.status,
        badge:      true,
        badgeClass: this.statusBadgeClass(wallet.status),
      },
      {
        label: 'Date Created',
        value: new DatePipe('en-US').transform(wallet.dateCreated, 'MMMM d, yyyy') ?? '',
      },
      {
        label:      'KYC',
        value:      wallet.kyc,
        badge:      true,
        badgeClass: this.kycBadgeClass(wallet.kyc),
      },
      {
        label:      'Account Tier',
        value:      wallet.accountTier,
        badge:      true,
        badgeClass: 'bg-[#EBF5FF] text-[#1041B7]',
      },
      {
        label: 'Last Funded',
        value: wallet.lastFunded
          ? new DatePipe('en-US').transform(wallet.lastFunded, 'MMMM d, yyyy') ?? '—'
          : '—',
      },
      {
        label: 'Last Activity',
        value: new DatePipe('en-US').transform(wallet.lastActivity, 'MMMM d, yyyy') ?? '',
      },
      { label: 'Restrictions', value: wallet.restrictions },
    ];
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.store.fetchWalletById(id);
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':   return 'bg-[#ECFDF5] text-[#059669]';
      case 'Frozen':   return 'bg-[#EFF6FF] text-[#3B82F6]';
      case 'Inactive': return 'bg-[#F3F4F6] text-[#6B7280]';
      default:         return 'bg-gray-100 text-gray-600';
    }
  }

  kycBadgeClass(kyc: string): string {
    switch (kyc) {
      case 'Verified':   return 'bg-[#EBF5FF] text-[#1041B7]';
      case 'Unverified': return 'bg-[#FEF2F2] text-[#DC2626]';
      case 'Pending':    return 'bg-[#FFFBEB] text-[#D97706]';
      default:           return 'bg-gray-100 text-gray-600';
    }
  }

  getCustomerInitials(): string {
    const customer = this.wallet()?.customer;
    if (!customer) return '';
    return `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase();
  }

  maskPhone(phone: string): string {
    if (!phone || phone === '—') return '—';
    return '•'.repeat(Math.max(0, phone.length - 3)) + phone.slice(-3);
  }

  goBack(): void {
    this.router.navigate(['/wallets']);
  }

updateBalance(): void {
  const wallet = this.wallet();
  const id = this.route.snapshot.paramMap.get('id');
  if (!wallet || !id) return;

  this.modalService.open(UpdateBalanceModalComponent, {
    data: {
      walletId:     wallet.walletId,
      walletHolder: `${wallet.customer.firstName} ${wallet.customer.lastName}`,
      onUpdate: (action: UpdateBalanceAction, amount: number, description: string) => {
        this.store.adjustWalletBalance(id, {
          action_type:   action === 'credit' ? 'CREDIT' : 'DEBIT',
          top_up_method: action === 'credit' ? 'manual-funding' : 'manual-deduction',
          amount,
          description,
        });
      },
    },
    maxWidth:   '560px',
    isCentered: true,
  });
}

toggleFreezeWallet(): void {
  const wallet = this.wallet();
  const id = this.route.snapshot.paramMap.get('id');
  if (!wallet || !id) return;

  const isFrozen   = wallet.status === 'Frozen';
  const nextStatus: WalletStatus = isFrozen ? 'ACTIVE' : 'FROZEN';

  this.modalService.open(FreezeWalletModalComponent, {
    data: {
      walletId:     wallet.walletId,
      walletHolder: `${wallet.customer.firstName} ${wallet.customer.lastName}`,
      isFrozen,
      onConfirm: () => {
        this.store.updateWalletStatus(id, nextStatus);
      },
    },
    maxWidth:   '560px',
    isCentered: true,
  });
}

}