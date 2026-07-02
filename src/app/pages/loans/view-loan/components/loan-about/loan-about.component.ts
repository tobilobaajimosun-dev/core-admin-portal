import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PsSvgIconComponent } from "@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component";
import { LoanDetailAbout } from '@core/interfaces/loan.model';

@Component({
  selector: 'app-loan-about',
  standalone: true,
  imports: [CommonModule, DatePipe, PsSvgIconComponent],
  templateUrl: './loan-about.component.html',
})
export class LoanAboutComponent {
  @Input({ required: true }) about!: LoanDetailAbout;

  get data() {
    const a = this.about;
    return {
      loanAmount:        a.loanDetails.loanAmount,
      totalRepayment:    a.loanDetails.totalRepayment,
      loanId:            a.loanDetails.loanId,
      borrowerId:        a.loanDetails.borrowerId,
      disbursedVia:      a.loanDetails.disbursementMethod,

      repaymentBankName:  a.repaymentDetails.bankName,
      repaymentAccNumber: a.repaymentDetails.accountNumber,
      totalRepayments:    a.repaymentDetails.totalNumberOfRepayments,
      repaymentFrequency: a.repaymentDetails.repaymentFrequency,
      monthlyRepayment:   a.repaymentDetails.monthlyRepayment,
      firstRepaymentDate: a.repaymentDetails.firstRepaymentDate,
      firstRepaymentAmt:  a.repaymentDetails.firstRepaymentAmount,
      lastRepaymentAmt:   a.repaymentDetails.lastRepaymentAmount,

      interestRate:       a.interestAndFees.interestRate,
      interestCharged:    a.interestAndFees.interestIsCharged,
      interestAmount:     a.interestAndFees.interestAmount,
      startChargingFrom:  a.interestAndFees.startChargingInterestFrom,
      structuringFee:     0,
      principalFees:      a.interestAndFees.principalFees,
      adminFees:          a.interestAndFees.adminFees,
      tax:                a.interestAndFees.tax,

      undertakingVideo: { name: 'No video uploaded', uploadedAt: null },
      offerLetter:      { name: 'No offer letter', uploadedAt: null },

      liquidation: {
        releaseDate:  a.liquidationDetails.releaseDate,
        maturityDate: a.liquidationDetails.maturityDate,
        principal:    a.liquidationDetails.principal,
        interestRate: `${a.liquidationDetails.interestRate}% pa`,
        fees:         a.liquidationDetails.fees,
        penalty:      a.liquidationDetails.penalty,
        amountDue:    a.liquidationDetails.amountDue,
        paidToDate:   a.liquidationDetails.amountPaidToDate,
        interest2:    a.liquidationDetails.interest,
      },

      applicationLog: [] as { event: string; date: Date }[],
    };
  }
}