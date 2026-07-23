import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsSvgIconComponent }  from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsTooltipModule }     from '@pcsl-ui/ui/ps-tooltip/ps-tooltip.module';
import { CustomerService }     from '@core/services/customer.service';
import { CustomerMetricsData } from '@core/interfaces/customer.model';

interface CustomerStat {
  label:   string;
  value:   number;
  trend:   number | null;
  trendUp: boolean;
  tooltipDescription: string;
}

@Component({
  selector: 'app-customer-stats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PsTooltipModule, PsSvgIconComponent],
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
        tooltipDescription: 'The total number of registered customers on the platform, regardless of verification or transaction status.',
      },
      {
        label:   'KYC Verified',
        value:   bvn_verified.count,
        trend:   bvn_verified.average || null,
        trendUp: bvn_verified.average >= 0,
        tooltipDescription: 'The number of customers who have successfully completed BVN verification as part of KYC compliance.',
      },
      {
        label:   'Users active this month',
        value:   transaction_active.count,
        trend:   transaction_active.average || null,
        trendUp: transaction_active.average >= 0,
        tooltipDescription: 'The number of customers who have carried out at least one transaction within the current calendar month.',
      },
      {
        label:   'Inactive Users this month',
        value:   transaction_inactive.count,
        trend:   transaction_inactive.average || null,
        trendUp: transaction_inactive.average >= 0,
        tooltipDescription: 'The number of customers who have not carried out any transaction within the current calendar month.',
      },
    ];
  }
}