import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PsSvgIconComponent }    from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { CustomerStore } from '@core/store/customer.store';
import { CustomerActivityRaw } from '@core/interfaces/customer.model';

@Component({
  selector: 'app-customer-recent-activity',
  standalone: true,
  imports: [CommonModule, DatePipe, PsSvgIconComponent, PsPaginationComponent],
  templateUrl: './customer-recent-activity.component.html',
})
export class CustomerRecentActivityComponent implements OnInit {
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private store  = inject(CustomerStore);

  columns       = ['Action', 'Module', 'IP Address', 'Date & Time', ''];
  filterOptions = ['Activity Module'];

  // adjust this if the customerId lives on a parent route
  private customerId = this.route.snapshot.paramMap.get('id')
    ?? this.route.parent?.snapshot.paramMap.get('id')
    ?? '';

  activityLogs   = this.store.customerActivity;
  isLoading      = this.store.isLoadingActivity;
  total          = this.store.customerActivityTotal;
  currentLimit   = computed(() => this.store.activityListConfig().limit ?? 10);
  currentPage    = computed(() => this.store.activityListConfig().page ?? 1);

  ngOnInit(): void {
    this.store.fetchCustomerActivity({
      customerId: this.customerId,
      params: { page: 1, limit: 10 },
    });
  }

  openDetail(log: CustomerActivityRaw): void {
    this.router.navigate(
      ['activity-log', log.id],
      { relativeTo: this.route, state: { log } }
    );
  }

  onSearch(term: string): void {
    this.store.setActivitySearch(this.customerId, term);
  }

  onModuleFilter(mod: string): void {
    this.store.setActivityModuleFilter(this.customerId, mod);
  }

  onPageChange(page: number): void {
    this.store.setActivityPage(this.customerId, page);
  }

  onPageSizeChange(size: number): void {
    this.store.setActivityPageSize(this.customerId, size);
  }
}