import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsSvgIconComponent }  from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { CustomerService }     from '@core/services/customer.service';
import { CustomerMetricsData } from '@core/interfaces/customer.model';

interface CustomerStat {
  label:   string;
  value:   number;
  trend:   number | null;
  trendUp: boolean;
}

@Component({
  selector: 'app-customer-stats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PsSvgIconComponent],
  templateUrl: './customer-stats.component.html',
})
export class CustomerStatsComponent implements OnInit {
  private readonly customerService = inject(CustomerService);

  isLoading     = signal(true);
  skeletonItems = new Array(4);
  stats         = signal<CustomerStat[]>([]);

  ngOnInit(): void {
    this.customerService.getCustomerMetrics().subscribe({
      next: ({ data }) => {
        this.stats.set(this.mapMetrics(data));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  private mapMetrics(data: CustomerMetricsData): CustomerStat[] {
    const { total, bvn_verified, transaction_active, transaction_inactive } = data.customers;

    return [
      {
        label:   'Total Users',
        value:   total.count,
        trend:   total.average || null,
        trendUp: total.average >= 0,
      },
      {
        label:   'KYC Verified',
        value:   bvn_verified.count,
        trend:   bvn_verified.average || null,
        trendUp: bvn_verified.average >= 0,
      },
      {
        label:   'Users active this month',
        value:   transaction_active.count,
        trend:   transaction_active.average || null,
        trendUp: transaction_active.average >= 0,
      },
      {
        label:   'Inactive Users this month',
        value:   transaction_inactive.count,
        trend:   transaction_inactive.average || null,
        trendUp: transaction_inactive.average >= 0,
      },
    ];
  }
}