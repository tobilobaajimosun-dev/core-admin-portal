import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { ArrowLeft01Icon } from '@hugeicons-pro/core-stroke-rounded';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';

import { LoanService } from '../../shared/services/loan.service';
import { Loan, LoanStatus, LOAN_STATUSES } from '../../shared/models/loan.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { NairaPipe } from '../../shared/pipes/naira.pipe';
import { statusTone } from '../../shared/utils/status-tone';
import { formatLabel } from '../../shared/utils/format';
import { ModalShellComponent } from '@pages/asset-flex/shared/components/modal-shell/modal-shell.component';

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
  ],
  templateUrl: './loan-detail.component.html',
  styleUrl: './loan-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanDetailComponent implements OnInit {
  private readonly loanService = inject(LoanService);
  private readonly toast = inject(PsToastService);

  readonly id = input<string>('');

  protected readonly backIcon = ArrowLeft01Icon;
  protected readonly statusTone = statusTone;
  protected readonly label = formatLabel;
  protected readonly statuses = LOAN_STATUSES;

  protected readonly loan = signal<Loan | null>(null);
  protected readonly loading = signal(true);
  protected readonly dialogOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly statusControl = new FormControl<LoanStatus>('ACTIVE', { nonNullable: true });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    const id = this.id();
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.loanService.getOne(id).subscribe({
      next: (res) => {
        this.loan.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected openDialog(): void {
    const l = this.loan();
    if (l) this.statusControl.setValue(l.status);
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    if (this.saving()) return;
    this.dialogOpen.set(false);
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
      error: () => this.saving.set(false),
    });
  }
}
