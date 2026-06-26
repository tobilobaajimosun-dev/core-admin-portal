import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsEmptyComponent }   from '@pcsl-ui/ui/ps-empty/ps-empty.component';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component'; // ← add
import { PsModalService }     from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { CustomerService }    from '@core/services/customer.service';
import { CustomerNeedsActionParams, CustomerNeedsActionRaw } from '@core/interfaces/customer.model';
import { issueToLabel }       from '@shared/utils/customer-issue.utils';
import { AddressVerificationModalComponent } from '@shared/components/modals/address-verification-modal/address-verification-modal.component';

@Component({
  selector: 'app-view-all-needs-attention',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, PsSvgIconComponent, PsEmptyComponent, PsPaginationComponent], // ← add
  templateUrl: './view-all-needs-attention.component.html',
})
export class ViewAllNeedsAttentionComponent implements OnInit {
  private readonly router          = inject(Router);
  private readonly modalService    = inject(PsModalService);
  private readonly customerService = inject(CustomerService);
  private readonly destroyRef      = inject(DestroyRef);

  isLoading    = signal(true);
  skeletonRows = new Array(8);
  searchQuery  = signal('');

  // Pagination state
  private allCustomers = signal<CustomerNeedsActionRaw[]>([]);
  total       = signal(0);      
  totalPages  = signal(0);      
  currentPage = signal(1);
  pageSize    = signal(10);     

  // Client-side search filter
  customers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.allCustomers();
    return this.allCustomers().filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  private readonly debouncedSearch$ = toObservable(this.searchQuery).pipe(
    skip(1),
    debounceTime(300),
    distinctUntilChanged(),
  );

  ngOnInit(): void {
    this.loadPage(1);

    this.debouncedSearch$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => { /* filter handled by computed() */ });
  }

  private loadPage(page: number, limit = this.pageSize()): void {
    this.isLoading.set(true);
    const params: CustomerNeedsActionParams = { page, limit };
    this.customerService.getNeedsAttention(params).subscribe({
      next: ({ data }) => {
        this.allCustomers.set(data.data);
        this.total.set(data.meta.total);
        this.totalPages.set(data.meta.totalPages);
        this.currentPage.set(page);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onPageChange(page: number): void {
    this.loadPage(page, this.pageSize());
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.loadPage(1, size);
  }

  getKycLabel(customer: CustomerNeedsActionRaw): string {
    return issueToLabel(customer.issue);
  }

  goBack(): void {
    this.router.navigate(['/customers']);
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