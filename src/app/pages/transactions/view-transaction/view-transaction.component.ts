import { Component, inject, signal, computed, OnInit, effect, untracked } from '@angular/core';
import { CommonModule }               from '@angular/common';
import { Router, ActivatedRoute }     from '@angular/router';
import { PsSvgIconComponent }         from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { TransactionStore }           from '@core/store/transaction.store';
import { TransactionCustomer }        from '@core/interfaces/transaction.model';
import { CustomerService }            from '@core/services/customer.service';

interface InfoRow {
  label:      string;
  value:      string;
  badge?:     boolean;
  badgeClass?: string;
}

@Component({
  selector: 'app-view-transaction',
  standalone: true,
  imports: [CommonModule, PsSvgIconComponent],
  templateUrl: './view-transaction.component.html',
})
export class ViewTransactionComponent implements OnInit {
  private readonly router          = inject(Router);
  private readonly route           = inject(ActivatedRoute);
  private readonly customerService = inject(CustomerService);
  readonly store                   = inject(TransactionStore);

  customer  = signal<TransactionCustomer | null>(null);
  revealPhone = false;

  transaction = computed(() => this.store.selectedTransaction());
  isLoading   = computed(() => this.store.isLoadingDetail());

  constructor() {
    effect(() => {
      const tx = this.transaction();
        console.log('effect fired, tx:', tx?.customer_id, 'customer:', untracked(() => this.customer()));

      if (!tx) return; // not loaded yet — effect will re-run when tx arrives

      // Only fetch if we don't already have customer data
      // Use untracked so reading customer() doesn't add it as a dependency
      const alreadyHasCustomer = untracked(() => this.customer());
      if (alreadyHasCustomer) return;
  console.log('fetching customer for id:', tx.customer_id);

      this.customerService.getCustomerById(tx.customer_id).subscribe({
        next: (res) => {
                console.log('customer response:', res);
          const c = res.data.customer;
          this.customer.set({
            id:        c.id,
            firstName: c.firstName,
            lastName:  c.lastName,
            email:     c.email ?? '',
          });
        },
        error: () => {},
      });
    });
  }

  ngOnInit(): void {
    const state = history.state;
    if (state?.customer) {
      this.customer.set(state.customer);
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.fetchTransactionById(id);
    }
  }

  infoRows = computed((): InfoRow[] => {
    const transaction = this.transaction();
    if (!transaction) return [];
    const transactionable = transaction.transactionable;
      if (!transactionable) return [];
    return [
      {
        label:      'Transaction Type',
        value:      transaction.type.charAt(0) + transaction.type.slice(1).toLowerCase(),
        badge:      true,
        badgeClass: 'bg-[#EBF5FF] text-[#1041B7]',
      },
      {
        label:      'Status',
        value:      transactionable.status.charAt(0) + transactionable.status.slice(1).toLowerCase(),
        badge:      true,
        badgeClass: this.statusBadgeClass(transactionable.status),
      },
      { label: 'Category',          value: transactionable.category                                    },
      { label: 'Provider',          value: transactionable.provider                                    },
      { label: 'Service',           value: transactionable.service                                     },
      { label: 'Reference No',      value: transaction.reference_no                                    },
      { label: 'Wallet Reference',  value: transactionable.wallet_transaction_reference                },
      { label: 'Provider Response', value: transactionable.message ?? '—'                              },
      { label: 'Account Number',    value: transactionable.wallet_transaction_payload.account_number   },
      {
        label: 'Balance After',
        value: `₦${transactionable.wallet_transaction_payload.available_balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      },
    ];
  });

  transactionId     = computed(() => this.transaction()?.reference_no ?? '');
  transactionDate   = computed(() => this.transaction()?.createdAt ?? '');
  transactionAmount = computed(() => this.transaction()?.amount ?? 0);
  transactionStatus = computed(() => this.transaction()?.status ?? '');
  transactionType   = computed(() => this.transaction()?.type ?? '');

  statusBadgeClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'SUCCESSFUL': return 'bg-[#ECFDF5] text-[#059669]';
      case 'FAILED':     return 'bg-[#FEF2F2] text-[#DC2626]';
      case 'PENDING':    return 'bg-[#FFFBEB] text-[#D97706]';
      case 'REVERSED':   return 'bg-[#EEF2FF] text-[#6366F1]';
      default:           return 'bg-gray-100 text-gray-600';
    }
  }

  maskPhone(phone: string): string {
    if (!phone || phone === '—') return '—';
    return '•'.repeat(Math.max(0, phone.length - 4)) + phone.slice(-4);
  }

  copytransactionId(): void {
    const ref = this.transaction()?.reference_no;
    if (ref) navigator.clipboard.writeText(ref).catch(() => {});
  }

  goBack(): void { this.router.navigate(['/transactions']); }

  downloadReceipt(): void {
    console.log('Download receipt for', this.transaction()?.reference_no);
  }

  getCustomerInitials(): string {
    const c = this.customer();
    if (!c) return '';
    return `${c.firstName.charAt(0)}${c.lastName.charAt(0)}`.toUpperCase();
  }

  viewCustomer(): void {
    const id = this.customer()?.id;
    if (id) this.router.navigate(['/users', id]);
  }
}