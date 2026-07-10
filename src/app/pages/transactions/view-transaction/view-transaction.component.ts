import { Component, inject, signal, computed, OnInit, effect, untracked, DestroyRef } from '@angular/core';
import { CommonModule }               from '@angular/common';
import { Router, ActivatedRoute }     from '@angular/router';
import { PsSvgIconComponent }         from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsModalService }            from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { RefundConfirmModalComponent } from '@shared/components/modals/refund-confirm-modal/refund-confirm-modal.component';
import { TransactionStore }           from '@core/store/transaction.store';
import { TransactionCustomer }        from '@core/interfaces/transaction.model';
import { CustomerService }            from '@core/services/customer.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReceiptModalComponent } from '@shared/components/modals/receipt-modal/receipt-modal.component';


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
  private readonly modalService    = inject(PsModalService);
  readonly store                   = inject(TransactionStore);
  private readonly destroyRef      = inject(DestroyRef);

  customer  = signal<TransactionCustomer | null>(null);
  revealPhone = false;

  // Tracks whether a retry has been attempted for the currently loaded
  // transaction. Refund stays locked until this flips to true.
  hasAttemptedRetry = signal(false);

  transaction = computed(() => this.store.selectedTransaction());
  isLoading   = computed(() => this.store.isLoadingDetail());
  isLoadingReceipt = computed(() => this.store.isLoadingReceipt());
  isRetrying  = computed(() => this.store.isRetrying());
  isRefunding = computed(() => this.store.isRefunding());
  retrySucceeded = computed(() => this.store.retrySucceeded());
  isSuccessful = computed(() => this.transactionStatus().toUpperCase() === 'SUCCESS');

  canRefund = computed(() => {
    if (this.isSuccessful()) return false;
    if (this.isRefunding()) return false;
    return this.hasAttemptedRetry();
  });

  constructor() {
  effect(() => {
    const tx = this.transaction();
    if (!tx) return;

    const alreadyHasCustomer = untracked(() => this.customer());
    if (alreadyHasCustomer) return;

    this.customerService.getCustomerById(tx.customer_id).subscribe({
      next: (res) => {
        const c = res.data.customer;
        this.customer.set({
          id:        c.id,
          firstName: c.firstName,
          lastName:  c.lastName,
          email:     c.email ?? '',
        });
      },
      error: () => {
        this.customer.set(null);
      },
    });
  });
}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('id');
        if (!id) return;

        // Reset all per-transaction state so nothing leaks in from the
        // previously viewed transaction when Angular reuses this
        // component instance across same-route navigations.
        this.customer.set(null);
        this.hasAttemptedRetry.set(false);
        this.store.resetRetryState();

        const state = history.state;
        if (state?.customer) {
          this.customer.set(state.customer);
        }

        this.store.fetchTransactionById(id);
      });
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
      { label: 'Account Number',    value: transactionable.wallet_transaction_payload?.account_number   },
      {
        label: 'Balance After',
        value: `₦${transactionable.wallet_transaction_payload?.available_balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
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
      case 'REFUNDED':   return 'bg-[#EBF5FF] text-[#1041B7]';
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
  const id = this.transaction()?.id;
  if (!id) return;

  this.store.fetchReceipt(id);
  this.modalService.open(ReceiptModalComponent, {
    maxWidth: '540px',
    isCentered: true,
  });
}

retryTransaction(): void {
  const id = this.transaction()?.id;
  if (!id || this.isRetrying()) return;
  this.store.retryTransaction(id);
  this.hasAttemptedRetry.set(true);
}


openRefundModal(): void {
  if (!this.canRefund()) return;
  const id = this.transaction()?.id;
  if (!id) return;

  this.modalService.open(RefundConfirmModalComponent, {
    maxWidth: '520px',
    isCentered: true,
    data: {
      amount: this.transactionAmount(),
      onConfirm: (reason: string) => this.store.refundTransaction(id, reason),
    },
  });
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