import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { PsSvgIconComponent }    from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsEmptyComponent }      from '@pcsl-ui/ui/ps-empty/ps-empty.component';
import { DropdownComponent }     from '@shared/components/dropdown/dropdown.component';
import { CustomerStore }         from '@core/store/customer.store';
import { CustomerRaw }           from '@core/interfaces/customer.model';

@Component({
  selector: 'app-recent-customers',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule,
     PsPaginationComponent,
     PsEmptyComponent,
     PsSvgIconComponent,
     DropdownComponent],
  templateUrl: './recent-customers.component.html',
})
export class RecentCustomersComponent implements OnInit {
  private readonly router = inject(Router);
  readonly store          = inject(CustomerStore);

  skeletonRows = new Array(5);
  columns      = ['Date & Time', 'Customer Details', 'KYC Status', 'Wallet Status', ''];

  isLoading  = this.store.isLoading;
  customers  = this.store.customers;
  currentPage = signal(1);
  
  ngOnInit(): void {
    this.store.fetchCustomers({ page: 1, limit: 5 });
  }

  viewAll(): void {
    this.router.navigate(['/customers']);
  }

  onPageChange(page: number):     void { 
    this.store.setPage(page);
    this.currentPage.set(page); 
   }
  onPageSizeChange(size: number): void { 
    this.store.setPageSize(size);
    this.currentPage.set(1); 
  }


  getKycStatus(customer: CustomerRaw): string {
    if (customer.is_bvn_verified)               return 'Verified';
    if (customer.bvn && !customer.is_bvn_verified)     return 'Partial';
    return 'Unverified';
  }

  getWalletStatus(customer: CustomerRaw): string {
    return customer.has_wallet ? 'Created' : 'Not Created';
  }

  getInitials(customer: CustomerRaw): string {
    return `${(customer.firstName ?? ' ').charAt(0)}${(customer.lastName ?? ' ').charAt(0)}`.toUpperCase();
  }

  // ── KYC pill styles ────────────────────────────────────────────────────────

  getKycColor(status: string): string {
    const map: Record<string, string> = {
      'Verified':   '#10B981',
      'Partial':    '#9B59B6',
      'Unverified': '#6B7280',
    };
    return map[status] ?? '#6B7280';
  }

  getKycBg(status: string): string {
    const map: Record<string, string> = {
      'Verified':   '#D1FAE5',
      'Partial':    '#F3E8FF',
      'Unverified': '#F3F4F6',
    };
    return map[status] ?? '#F3F4F6';
  }

   viewCustomer(customer: CustomerRaw): void {
    this.router.navigate(['/users', customer.id]);
  }

  viewLoanHistory(customer: CustomerRaw): void {
    console.log('View loan history', customer.id);
  }

  deactivateCustomer(customer: CustomerRaw): void {
    console.log('Deactivate', customer.id);
  }


  // ── Wallet pill styles ─────────────────────────────────────────────────────

  getWalletColor(_status: string): string { return '#51575B'; }
  getWalletBg(_status: string):    string { return '#EEF5F9'; }
}