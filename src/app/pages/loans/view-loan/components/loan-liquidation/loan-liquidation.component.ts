import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-loan-liquidation',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './loan-liquidation.component.html',
})
export class LoanLiquidationComponent {
  readonly data = {
    // Summary banner
    totalAmount:   127_879.17,
    paid:          557_600.01,
    balance:       625_049.99,
    lastUpdated:   '30 mins ago',

    // Detail rows
    releaseDate:   new Date('2024-06-05'),
    maturityDate:  new Date('2024-06-05'),
    principal:     27_012.50,
    interestRate:  '₦0/Month',
    monthlyRepayment: 50_000,
    fees:          82_650.00,
    penalty:       2_000.00,
    amountDue:     1_182_650.00,
    paidToDate:    557_601.01,
    interest:      0,
  };
}
