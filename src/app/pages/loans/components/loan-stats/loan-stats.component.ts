import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsSvgIconComponent } from "@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component";

interface LoanStatCard {
  label: string;
  value: string | number;
  isCurrency: boolean;
  suffix?: string;
  trend: number;
  trendUp: boolean;
}

@Component({
  selector: 'app-loan-stats',
  imports: [CommonModule, PsSvgIconComponent],
  templateUrl: './loan-stats.component.html',
  styleUrl: './loan-stats.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanStatsComponent {

  readonly topStats: LoanStatCard[] = [
    { label: 'Total Loan Applications', value: 20, isCurrency: false, trend: 0, trendUp: true },
    { label: 'Total Disbursed Loans',   value: 8,  isCurrency: false, trend: 0, trendUp: true },
    { label: 'Active Loans',            value: 12, isCurrency: false, trend: 0, trendUp: true },
  ];

readonly bottomStats: LoanStatCard[] = [
  { label: 'Outstanding Balance', value: 203000, isCurrency: true, trend: 0, trendUp: true },
  { label: 'Total Repaid',        value: 103000, isCurrency: true,               trend: 0, trendUp: true },
  { label: 'Default Rate',        value: 0,      isCurrency: false,              trend: 0, trendUp: true },
];
}