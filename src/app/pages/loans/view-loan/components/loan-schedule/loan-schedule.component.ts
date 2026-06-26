import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

export interface ScheduleRow {
  scheduledDate: Date;
  narration:     string;
  principal:     number;
  interest:      number | null;
  fees:          number | null;
  totalAmount:   number;
  status:        'Paid' | 'Not paid' | 'Upcoming';
}

const MOCK_SCHEDULE: ScheduleRow[] = [
  { scheduledDate: new Date('2026-08-29'), narration: 'Part Loan Repayment', principal: 80_010, interest: null,  fees: null,   totalAmount: 80_010, status: 'Paid'     },
  { scheduledDate: new Date('2026-09-05'), narration: 'Part Loan Repayment', principal: 80_010, interest: null,  fees: null,   totalAmount: 80_010, status: 'Not paid' },
  { scheduledDate: new Date('2026-09-12'), narration: 'Part Loan Repayment', principal: 80_010, interest: null,  fees: null,   totalAmount: 80_010, status: 'Upcoming' },
  { scheduledDate: new Date('2026-09-19'), narration: 'Part Loan Repayment', principal: 80_010, interest: 5_010, fees: 10_010, totalAmount: 80_010, status: 'Upcoming' },
  { scheduledDate: new Date('2026-09-26'), narration: 'Part Loan Repayment', principal: 80_010, interest: 8_010, fees: 80_010, totalAmount: 80_010, status: 'Upcoming' },
];

@Component({
  selector: 'app-loan-schedule',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './loan-schedule.component.html',
})
export class LoanScheduleComponent {
  readonly schedule = MOCK_SCHEDULE;

  columns = ['Scheduled Date', 'Narration', 'Principal', 'Interest', 'Fees', 'Total Amount', 'Status'];

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