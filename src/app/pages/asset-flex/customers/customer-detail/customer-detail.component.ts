import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { ArrowLeft01Icon } from '@hugeicons-pro/core-stroke-rounded';

import { CustomerService } from '../../shared/services/customer.service';
import { LoanService } from '../../shared/services/loan.service';
import { Customer } from '../../shared/models/customer.model';
import { Loan, RepaymentRecord } from '../../shared/models/loan.model';
import { StatusBadgeComponent, BadgeTone } from '../../shared/components/status-badge/status-badge.component';
import { CategoryChipComponent } from '../../shared/components/category-chip/category-chip.component';
import { NairaPipe } from '../../shared/pipes/naira.pipe';
import { statusTone } from '../../shared/utils/status-tone';
import { fetchAllPages } from '@pages/asset-flex/shared/utils/fetch-all-pages';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { DetailSkeletonComponent } from '@pages/asset-flex/shared/components/detail-skeleton/detail-skeleton.component';

/** Masks all but the last 4 chars of a sensitive value. */
function mask(value: string | null | undefined): string {
  if (!value) return '—';
  const s = String(value);
  return s.length <= 4 ? '••••' : '••••••' + s.slice(-4);
}

@Component({
  selector: 'app-customer-detail',
  imports: [
    DatePipe,
    RouterLink,
    HugeiconsIconComponent,
    StatusBadgeComponent,
    CategoryChipComponent,
    NairaPipe,
    ErrorStateComponent,
    DetailSkeletonComponent,
  ],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetailComponent {
  private readonly customerService = inject(CustomerService);
  private readonly loanService = inject(LoanService);

  readonly id = input<string>('');
  protected readonly backIcon = ArrowLeft01Icon;
  protected readonly statusTone = statusTone;

  protected readonly customer = signal<Customer | null>(null);
  protected readonly loans = signal<Loan[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  protected readonly fullName = computed(() => {
    const c = this.customer();
    return c ? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.email : '—';
  });
  protected readonly initials = computed(() => {
    const c = this.customer();
    if (!c) return '?';
    return `${c.firstName?.[0] ?? ''}${c.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  });
  protected readonly maskedBvn = computed(() => mask(this.customer()?.bvn));
  protected readonly maskedNin = computed(() => mask(this.customer()?.nin));

  protected readonly repayments = computed<RepaymentRecord[]>(() =>
    this.loans()
      .flatMap((l) => l.repayments ?? [])
      .sort((a, b) => b.date.localeCompare(a.date)),
  );
  protected readonly totalBorrowed = computed(() =>
    this.loans().reduce((s, l) => s + Number(l.amountDisbursed || l.principalAmount || 0), 0),
  );
  protected readonly outstanding = computed(() => {
    const active = this.loans().filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE' || l.status === 'DISBURSED');
    const owed = active.reduce((s, l) => s + Number(l.totalRepayable || 0), 0);
    const paid = active.flatMap((l) => l.repayments ?? []).reduce((s, r) => s + Number(r.amount), 0);
    return Math.max(0, owed - paid);
  });
  protected readonly onTimeRate = computed(() => {
    const insts = this.loans().flatMap((l) => l.repaymentSchedule ?? []);
    const paid = insts.filter((i) => i.status === 'PAID').length;
    const overdue = insts.filter((i) => i.status === 'OVERDUE').length;
    const denom = paid + overdue;
    return denom ? Math.round((paid / denom) * 100) : 100;
  });

  // ── Risk assessment (0–100; higher = safer) ─────────────────────────────
  private readonly verified = computed(
    () => this.customer()?.bvnVerification?.status === 'SUCCESS' && this.customer()?.ninVerification?.status === 'SUCCESS',
  );
  private readonly dtiOk = computed(() => {
    const income = Number(this.customer()?.work?.monthlyIncome || 0);
    return income > 0 && this.outstanding() <= income * 3;
  });
  protected readonly riskScore = computed(() => {
    if (!this.customer()) return 50;
    let score = 50;
    score += (this.onTimeRate() - 50) / 2; // ±25 from repayment behaviour
    score += this.verified() ? 15 : -15; // identity verification
    score += Number(this.customer()?.work?.monthlyIncome || 0) > 0 ? (this.dtiOk() ? 12 : -12) : 0;
    score += this.loans().length > 0 ? 8 : -5; // credit history
    return Math.max(0, Math.min(100, Math.round(score)));
  });
  protected readonly riskBand = computed(() =>
    this.riskScore() >= 70 ? 'Low risk' : this.riskScore() >= 45 ? 'Medium risk' : 'High risk',
  );
  protected readonly riskTone = computed<BadgeTone>(() =>
    this.riskScore() >= 70 ? 'success' : this.riskScore() >= 45 ? 'warning' : 'danger',
  );
  protected readonly riskColor = computed(() =>
    this.riskScore() >= 70 ? '#16a34a' : this.riskScore() >= 45 ? '#d97706' : '#dc2626',
  );
  protected readonly riskFactors = computed(() => {
    if (!this.customer()) return [];
    const rate = this.onTimeRate();
    return [
      { label: 'On-time repayments', detail: `${rate}% paid on time`, impact: rate >= 70 ? 'positive' : rate >= 40 ? 'neutral' : 'negative' },
      { label: 'Identity verification', detail: this.verified() ? 'BVN & NIN verified' : 'Not fully verified', impact: this.verified() ? 'positive' : 'negative' },
      { label: 'Debt-to-income', detail: this.dtiOk() ? 'Within 3× monthly income' : 'Above 3× monthly income', impact: this.dtiOk() ? 'positive' : 'negative' },
      { label: 'Credit history', detail: `${this.loans().length} loan(s) on record`, impact: this.loans().length > 0 ? 'positive' : 'neutral' },
    ];
  });

  protected verificationTone(status: string | undefined): BadgeTone {
    return status === 'SUCCESS' ? 'success' : status === 'FAILED' ? 'danger' : 'warning';
  }
  protected docTone(status: string): BadgeTone {
    return status === 'VERIFIED' ? 'success' : status === 'REJECTED' ? 'danger' : 'warning';
  }

  constructor() {
    effect(() => {
      this.id();
      this.load();
    });
  }

  protected retry(): void {
    this.load();
  }

  private load(): void {
    const id = this.id();
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.loadError.set(false);
    this.loans.set([]);
    this.customerService.getOne(id).subscribe({
      next: (res) => {
        this.customer.set(res.data ?? null);
        this.loading.set(false);
        this.loadLoans(id);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  private loadLoans(id: string): void {
    fetchAllPages((page) => this.loanService.list({ page, limit: 100 })).subscribe({
      next: (loans) => this.loans.set(loans.filter((l) => l.customerId === id)),
      error: () => this.loans.set([]),
    });
  }
}
