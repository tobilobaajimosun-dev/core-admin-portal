import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { ArrowLeft01Icon } from '@hugeicons-pro/core-stroke-rounded';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';

import { LoanService } from '../../shared/services/loan.service';
import { Loan, LoanStatus, LOAN_STATUS_TRANSITIONS } from '../../shared/models/loan.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { NairaPipe } from '../../shared/pipes/naira.pipe';
import { statusTone } from '../../shared/utils/status-tone';
import { formatLabel } from '../../shared/utils/format';
import { ModalShellComponent } from '@pages/asset-flex/shared/components/modal-shell/modal-shell.component';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { DetailSkeletonComponent } from '@pages/asset-flex/shared/components/detail-skeleton/detail-skeleton.component';

@Component({
  selector: 'app-loan-detail',
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    HugeiconsIconComponent,
    StatusBadgeComponent,
    NairaPipe,
    ModalShellComponent,
    ErrorStateComponent,
    DetailSkeletonComponent,
  ],
  templateUrl: './loan-detail.component.html',
  styleUrl: './loan-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanDetailComponent {
  private readonly loanService = inject(LoanService);
  private readonly toast = inject(PsToastService);

  readonly id = input<string>('');

  protected readonly backIcon = ArrowLeft01Icon;
  protected readonly statusTone = statusTone;
  protected readonly label = formatLabel;

  protected readonly loan = signal<Loan | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly dialogOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly statusControl = new FormControl<LoanStatus>('ACTIVE', { nonNullable: true });

  /** Valid next statuses for the loan's current status; empty when terminal. */
  protected readonly allowedNextStatuses = computed(() => {
    const l = this.loan();
    return l ? LOAN_STATUS_TRANSITIONS[l.status] : [];
  });

  /** Statuses offered by the generic "Update status" dialog — DISBURSED is handled by its own scoped action. */
  protected readonly otherNextStatuses = computed(() => this.allowedNextStatuses().filter((s) => s !== 'DISBURSED'));

  protected readonly canDisburse = computed(
    () => this.loan()?.status === 'PENDING_DISBURSEMENT' && this.allowedNextStatuses().includes('DISBURSED'),
  );
  protected readonly disburseDialogOpen = signal(false);
  protected readonly disbursing = signal(false);

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
    this.loanService.getOne(id).subscribe({
      next: (res) => {
        this.loan.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  protected openDialog(): void {
    const next = this.otherNextStatuses();
    if (next.length === 0) return;
    this.statusControl.setValue(next[0]);
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    if (this.saving()) return;
    this.dialogOpen.set(false);
  }

  protected openDisburseDialog(): void {
    if (!this.canDisburse()) return;
    this.disburseDialogOpen.set(true);
  }

  protected closeDisburseDialog(): void {
    if (this.disbursing()) return;
    this.disburseDialogOpen.set(false);
  }

  protected confirmDisburse(): void {
    const id = this.id();
    if (!id) return;
    this.disbursing.set(true);
    this.loanService.updateStatus(id, { status: 'DISBURSED' }).subscribe({
      next: () => {
        this.toast.success('Loan disbursed.');
        this.disbursing.set(false);
        this.disburseDialogOpen.set(false);
        this.load();
      },
      error: () => {
        this.disbursing.set(false);
        this.toast.error('Could not disburse this loan. Please try again.');
      },
    });
  }

  protected saveStatus(): void {
    const id = this.id();
    if (!id) return;
    this.saving.set(true);
    this.loanService.updateStatus(id, { status: this.statusControl.value }).subscribe({
      next: () => {
        this.toast.success('Loan status updated.');
        this.saving.set(false);
        this.dialogOpen.set(false);
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Could not update the loan status. Please try again.');
      },
    });
  }
}
