import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PsSvgIconComponent } from "@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component";

export const MOCK_ABOUT = {
  // Loan Details
  loanAmount:           180_010.00,
  totalRepayment:       260_010.92,
  loanId:               'CW409489',
  borrowerId:           'CW47839',
  disbursedVia:         'Online Transfer',

  // Repayment Details
  repaymentBankName:    'Guaranty Trust Bank PLC',
  repaymentAccNumber:   '98437/97493 02',
  totalRepayments:      12,
  repaymentFrequency:   'Monthly',
  monthlyRepayment:     50_000,
  firstRepaymentDate:   new Date('2024-03-31'),
  firstRepaymentAmt:    33_875.00,
  lastRepaymentAmt:     33_875.00,
  principalRepayDate:   new Date('2024-03-30'),
  nextRepaymentDate:    new Date('2024-06-12'),
  lastRepaymentDate:    new Date('2024-09-03'),

  // Interest & Fees
  interestRate:         2.35,
  interestCharged:      'Monthly',
  interestAmount:       16_375.00,
  startChargingFrom:    new Date('2024-03-13'),
  structuringFee:       0,
  principalFees:        30_000,
  adminFees:            10_000,
  tax:                  60_000,

  // Loan Undertaking Documents
  undertakingVideo: {
    name:       'ABN56/r/78b.pdf',
    uploadedAt: new Date('2024-09-10T14:00:00'),
    type:       'PDF',
  },
  offerLetter: {
    name:       'Agrecmen/78b.pdf',
    uploadedAt: new Date('2024-09-10T14:00:00'),
    type:       'PDF',
  },

  // Liquidation details (snapshot shown on About tab per design)
  liquidation: {
    releaseDate:   new Date('2024-06-05'),
    maturityDate:  new Date('2024-06-05'),
    principal:     27_012.50,
    interestRate:  '₦0/Month',
    fees:          82_650.00,
    penalty:       2_000.00,
    amountDue:     1_182_650.00,
    paidToDate:    557_601.01,
    interest:      0,
    historyAmt:    480_160.00,
    amountPaid:    1_182_650.00,
    amountToPay:   1_102_400.02,
    interest2:     0,
  },

  // Application Log
  applicationLog: [
    { event: 'Logged in',           date: new Date('2024-04-16T00:00:00') },
    { event: 'Applied',             date: new Date('2024-04-24T00:00:00') },
    { event: 'Provided data Form',  date: new Date('2024-04-26T00:00:00') },
    { event: 'final data form',     date: new Date('2024-04-28T00:00:00') },
  ],
};

@Component({
  selector: 'app-loan-about',
  standalone: true,
  imports: [CommonModule, DatePipe, PsSvgIconComponent],
  templateUrl: './loan-about.component.html',
})
export class LoanAboutComponent {
  readonly data = MOCK_ABOUT;
}