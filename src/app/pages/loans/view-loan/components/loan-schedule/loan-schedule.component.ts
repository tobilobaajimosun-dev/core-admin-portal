import { Component, Input, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LoanDetailScheduleRow } from '@core/interfaces/loan.model';
import { LoanStore } from '@core/store/loan.store';

@Component({
  selector: 'app-loan-schedule',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './loan-schedule.component.html',
})
export class LoanScheduleComponent {
  @Input({ required: true }) schedule: LoanDetailScheduleRow[] = [];
  @Input({ required: true }) loanApplicationId!: string;

  readonly store = inject(LoanStore);

  columns = ['Scheduled Date', 'Narration', 'Principal', 'Interest', 'Fees', 'Total Amount', 'Status'];

  exportSchedule(): void {
    this.store.exportRepaymentSchedule(this.loanApplicationId);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Paid':     'bg-[#ECFDF5] text-[#12B76A]',
      'Not paid': 'bg-[#FFF1F2] text-[#F04438]',
      'Upcoming': 'bg-[#EFF6FF] text-[#3B82F6]',
    };
    return map[status] ?? 'bg-[#F3F4F6] text-[#51575B]';
  }

  formatMoney(val: number | null): string {
    if (val === null || val === 0) return 'N0';
    return '₦' + val.toLocaleString('en-NG', { minimumFractionDigits: 2 });
  }
}