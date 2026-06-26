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

export interface WalletCustomer {
  id:         string;
  firstName:  string;
  lastName:   string;
  email:      string;
  phone:      string;
  avatarUrl?: string;
}

export interface LinkedBankAccount {
  bankName:      string;
  accountNumber: string;
  accountName:   string;
  dateLinked:    string; 
}

export interface WalletDetail {
  id:                 string;
  walletId:           string;
  status:             'Active' | 'Frozen' | 'Inactive';
  availableBalance:   number;
  totalFunded:        number;
  totalSpent:         number;
  transactionsCount:  number;
  dateCreated:        string; 
  kyc:                'Verified' | 'Unverified' | 'Pending';
  accountTier:        'Tier 1' | 'Tier 2' | 'Tier 3';
  lastFunded:         string; // ISO date string
  lastActivity:       string; 
  restrictions:       string;
  customer?:          WalletCustomer;
  linkedBankAccount?: LinkedBankAccount;
}

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

  revealPhone = false;

  isLoading = signal(false);
  wallet    = signal<WalletDetail | null>(null);

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
        value: new DatePipe('en-US').transform(wallet.lastFunded, 'MMMM d, yyyy') ?? '',
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
    if (id) this.loadWallet(id);
  }

  private loadWallet(id: string): void {
    this.isLoading.set(true);
    setTimeout(() => {
      this.wallet.set({
        id,
        walletId:           'WAL-273682',
        status:             'Active',
        availableBalance:   80000,
        totalFunded:        400000,
        totalSpent:         320000,
        transactionsCount:  89,
        dateCreated:        '2027-06-12T00:00:00',
        kyc:                'Verified',
        accountTier:        'Tier 3',
        lastFunded:         '2028-06-13T00:00:00',
        lastActivity:       '2029-06-13T00:00:00',
        restrictions:       'None',
        customer: {
          id:        'cust-001',
          firstName: 'Ademilua Josephine',
          lastName:  'Tayo',
          email:     'ademilua.josjos@gmail.com',
          phone:     '09030601323',
          avatarUrl: '',
        },
        linkedBankAccount: {
          bankName:      'Guaranty Trust Bank',
          accountNumber: '0557932377',
          accountName:   'Ekundayo Thomas',
          dateLinked:    '2028-06-13T00:00:00',
        },
      });
      this.isLoading.set(false);
    }, 0);
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
    if (!wallet) return;

    this.modalService.open(UpdateBalanceModalComponent, {
      data: {
        walletId:     wallet.walletId,
        walletHolder: wallet.customer
          ? `${wallet.customer.firstName} ${wallet.customer.lastName}`
          : wallet.walletId,
        onUpdate: (action: UpdateBalanceAction, amount: number, reason: string) => {
          //console.log('Update balance', { walletId: wallet.walletId, action, amount, reason });
        },
      },
      maxWidth:   '560px',
      isCentered: true,
    });
  }

  toggleFreezeWallet(): void {
    const wallet = this.wallet();
    if (!wallet) return;

    this.modalService.open(FreezeWalletModalComponent, {
      data: {
        walletId:     wallet.walletId,
        walletHolder: wallet.customer
          ? `${wallet.customer.firstName} ${wallet.customer.lastName}`
          : wallet.walletId,
        isFrozen: wallet.status === 'Frozen',
        onConfirm: () => {
          const newStatus = wallet.status === 'Frozen' ? 'Active' : 'Frozen';
          this.wallet.update(current => current ? { ...current, status: newStatus } : null);
         // console.log('Freeze/unfreeze wallet', { walletId: wallet.walletId, newStatus });
        },
      },
      maxWidth:   '560px',
      isCentered: true,
    });
  }
}