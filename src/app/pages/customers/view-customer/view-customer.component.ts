import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe }         from '@angular/common';
import { Router, ActivatedRoute }                      from '@angular/router';
import { PsSvgIconComponent }                from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { CustomerProfileComponent }          from './components/customer-profile/customer-profile.component';
import { CustomerLoansComponent }            from './components/customer-loans/customer-loans.component';
import { CustomerTransactionsComponent }     from './components/customer-transactions/customer-transactions.component';
import { CustomerRecentActivityComponent }   from './components/customer-recent-activity/customer-recent-activity.component';
import { SendNotificationModalComponent }    from '@shared/components/modals/send-notification-modal/send-notification-modal.component';
import { EditCustomerModalComponent }        from '@shared/components/modals/edit-customer-modal/edit-customer-modal.component';
import { SuspendCustomerModalComponent }     from '@shared/components/modals/suspend-customer-modal/suspend-customer-modal.component';
import { PsModalService }  from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { CustomerStore }   from '@core/store/customer.store';
import { CustomerWalletComponent } from './components/customer-wallet/customer-wallet.component';

export type CustomerTab = 'profile' | 'financial-summary' | 'loans' | 'transactions' | 'recent-activity';

interface Tab {
  value: CustomerTab;
  label: string;
  icon:  string;
}

@Component({
  selector: 'app-view-customer',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    PsSvgIconComponent,
    CustomerProfileComponent,
    CustomerWalletComponent,
    CustomerLoansComponent,
    CustomerTransactionsComponent,
    CustomerRecentActivityComponent,
  ],
  templateUrl: './view-customer.component.html',
})
export class ViewCustomerComponent implements OnInit {
  private readonly router       = inject(Router);
  private readonly route        = inject(ActivatedRoute);
  private readonly modalService = inject(PsModalService);
  readonly store                = inject(CustomerStore);
  
  revealPhone = false;

  activeTab = signal<CustomerTab>('profile');

  readonly tabSkeletonWidths = ['88px', '148px', '76px', '116px', '132px'];

  tabs: Tab[] = [
    { value: 'profile',           label: 'Profile',           icon: 'profile-icon'       },
    { value: 'financial-summary', label: 'Financial Summary', icon: 'wallet-icon'        },
    { value: 'loans',             label: 'Loans',             icon: 'loan-icon'          },
    { value: 'transactions',      label: 'Transactions',      icon: 'transactions-icon'  },
    { value: 'recent-activity',   label: 'Recent Activity',   icon: 'activity-logs-icon' },
  ];
  isLoading = computed(() => this.store.isLoading());

  customer = computed(() => {
    const detail = this.store.selectedCustomer();
    if (!detail) return null;

    const customer = detail.customer;
    const wallet = customer.customer_wallets;

    return {
      id:              customer.id,
      firstName:       customer.firstName,
      lastName:        customer.lastName,
      email:           customer.email         ?? '—',
      phone:           customer.phone         ?? '—',
      avatarUrl:       customer.profile_image ?? '',
      joinedAt:        customer.createdAt,
      lastActiveAt:    customer.updatedAt,
      walletBalance:   wallet?.available_balance ?? 0,
      loanCount:       Number(detail.loan_count.total),
      activeLoanCount: Number(detail.active_loan.total),
    };
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.store.fetchCustomerById(id);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getInitials(): string {
    const customer = this.customer();
    if (!customer) return '';
    return `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase();
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }

  openSendNotificationModal(): void {
    const customer = this.customer();
    if (!customer) return;
    this.modalService.open(SendNotificationModalComponent, {
      data: {
        customerName:  `${customer.firstName} ${customer.lastName}`,
        customerEmail: customer.email,
        onSend: (channel: string, subject: string, message: string) => {
          // console.log('Send notification', { channel, subject, message });
        },
      },
      maxWidth:   '560px',
      isCentered: true,
    });
  }

  openEditCustomerModal(): void {
    const customer = this.customer();
    if (!customer) return;
    this.modalService.open(EditCustomerModalComponent, {
      data: {
        firstName:   customer.firstName,
        lastName:    customer.lastName,
        email:       customer.email,
        phoneNumber: customer.phone,
        gender:      this.store.selectedCustomer()?.customer.gender ?? '',
        workType:    '',
        workplace:   '',
        onSave: (updated: { firstName: string; lastName: string; gender: string; workType: string; workplace: string }) => {
          const raw = this.store.selectedCustomer();
          if (!raw) return;
          this.store.patchSelectedCustomer({
            firstName: updated.firstName,
            lastName:  updated.lastName,
          });
        },
      },
      maxWidth:   '560px',
      isCentered: true,
    });
  }

  suspendCustomer(): void {
    const customer = this.customer();
    if (!customer) return;
    this.modalService.open(SuspendCustomerModalComponent, {
      data: {
        customerName: `${customer.firstName} ${customer.lastName}`,
        onSuspend: (reason: string, customReason?: string) => {
          //console.log('Suspend customer', { reason, customReason });
        },
      },
    });
  }

  maskPhone(phone: string): string {
  if (!phone || phone === '—') return '—';
  return '•'.repeat(Math.max(0, phone.length - 4)) + phone.slice(-4);
}
}