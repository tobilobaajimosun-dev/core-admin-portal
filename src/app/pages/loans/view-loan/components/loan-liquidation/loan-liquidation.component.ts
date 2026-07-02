import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-loan-liquidation',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './loan-liquidation.component.html',
})
export class LoanLiquidationComponent {
  @Input({ required: true }) data!: {
    totalAmount: number; paid: number; balance: number; lastUpdated: string;
    releaseDate: string; maturityDate: string; principal: number; interestRate: string;
    monthlyRepayment: number; fees: number; penalty: number; amountDue: number;
    paidToDate: number; interest: number;
  };
}