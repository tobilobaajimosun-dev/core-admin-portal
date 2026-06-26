import { Component } from '@angular/core';
import { PerformanceBannerComponent } from '@pages/home/components/performance-banner/performance-banner.component';
import { StatsGridComponent } from '@pages/home/components/stats-grid/stats-grid.component';
import { RecentLoansComponent } from '@pages/home/components/recent-loans/recent-loans.component';
import { TransactionHistoryComponent } from '@pages/home/components/transaction-history/transaction-history.component';
import { RecentCustomersComponent } from '@pages/home/components/recent-customers/recent-customers.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    // PerformanceBannerComponent,
    StatsGridComponent,
    RecentLoansComponent,
    TransactionHistoryComponent,
    RecentCustomersComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}