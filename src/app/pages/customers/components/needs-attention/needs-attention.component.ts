import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsModalService }     from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { CustomerService }    from '@core/services/customer.service';
import { CustomerNeedsActionRaw } from '@core/interfaces/customer.model';
import { issueToLabel }       from '@shared/utils/customer-issue.utils';
import { AddressVerificationModalComponent } from '@shared/components/modals/address-verification-modal/address-verification-modal.component';

@Component({
  selector: 'app-needs-attention',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PsSvgIconComponent],
  templateUrl: './needs-attention.component.html',
})
export class NeedsAttentionComponent implements OnInit {
  private readonly router          = inject(Router);
  private readonly modalService    = inject(PsModalService);
  private readonly customerService = inject(CustomerService);

  isLoading     = signal(true);
  skeletonItems = new Array(5);
  count         = signal(0);
  customers     = signal<CustomerNeedsActionRaw[]>([]);

  ngOnInit(): void {
    // Fetch only 5 for the dashboard widget; total count comes from meta
    this.customerService.getNeedsAttention({ page: 1, limit: 5 }).subscribe({
      next: ({ data }) => {
        this.customers.set(data.data);
        this.count.set(data.meta.total); // show real total, not just current page
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  getKycLabel(customer: CustomerNeedsActionRaw): string {
    return issueToLabel(customer.issue);
  }

  viewAll(): void {
    this.router.navigate(['/users/view-all-needs-attention']);
  }

  openVerificationModal(customer: CustomerNeedsActionRaw): void {
    this.modalService.open(AddressVerificationModalComponent, {
      maxWidth: '820px',
      isCentered: true,
      data: {
        customerName:     `${customer.firstName} ${customer.lastName}`,
        stateOfResidence: 'Lagos',
        streetAddress:    '12, Johnson Street, Ikeja',
        localGovernment:  'Lagos Mainland',
        nearestLandmark:  '-',
        documentImageUrl: '',
        kycLabel:         issueToLabel(customer.issue),
        onApprove: () => console.log('Approved:', customer.id),
        onReject:  (reason: string) => console.log('Rejected:', customer.id, reason),
      },
    });
  }
}