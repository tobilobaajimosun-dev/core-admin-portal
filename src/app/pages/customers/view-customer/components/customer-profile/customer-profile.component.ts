import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { CustomerDetailData } from '@core/interfaces/customer.model';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, PsSvgIconComponent],
  templateUrl: './customer-profile.component.html',
})
export class CustomerProfileComponent {
  @Input({ required: true }) data!: CustomerDetailData;

  revealed = { bvn: false, nin: false };

  toggleReveal(field: 'bvn' | 'nin') {
    this.revealed[field] = !this.revealed[field];
  }

  get customer() { return this.data.customer; }

  get profile() {
    const customer   = this.customer;
    const kyc = customer.loan_kyc_detail;
    const wallet   = customer.customer_wallets;

    return {
      // KYC Details
      bvn:              customer.bvn,
      nin:              customer.nin,
      verificationDate: customer.bvnVerified ?? customer.updatedAt,

      // Work Details
      employmentType: kyc?.salary_payment_type?.title ?? '—',
      salaryProvider: kyc?.job_option                 ?? '—',
      workIdNumber:   kyc?.identity_or_phone_number   ?? '—',

      // Verification Status
      emailVerified:   !!customer.emailVerified,
      bvnVerified:     customer.is_bvn_verified,
      addressVerified: false,

      // Salary / Wallet Details
      bankName:          wallet?.bank_name      ?? '—',
      bankAccountNumber: wallet?.account_number ?? '—',
      accountName:       wallet?.account_name   ?? `${customer.firstName} ${customer.lastName}`,
    };
  }

  mask(value: string | null | undefined): string {
    if (!value) return '—';
    return value.length > 3
      ? '•'.repeat(value.length - 3) + value.slice(-3)
      : value;
  }
}