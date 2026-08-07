import { DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';
import { SettlementService } from '../shared/services/settlement.service';
import { Settlement } from '../shared/models/settlement.model';
import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { ModalShellComponent } from '@pages/asset-flex/shared/components/modal-shell/modal-shell.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { NairaPipe } from '../shared/pipes/naira.pipe';
import { statusTone } from '../shared/utils/status-tone';
import { minTrimmedLength } from '../shared/utils/validators';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '@pages/asset-flex/shared/components/empty-state/empty-state.component';
import { exportToCsv } from '@pages/asset-flex/shared/utils/csv-export';

const FILTERS = ['', 'PENDING', 'DUE', 'SETTLED', 'FAILED'];

@Component({
  selector: 'app-settlements',
  imports: [
    DatePipe,
    TitleCasePipe,
    ReactiveFormsModule,
    PageHeaderComponent,
    ModalShellComponent,
    StatusBadgeComponent,
    NairaPipe,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  templateUrl: './settlements.component.html',
  styleUrl: './settlements.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettlementsComponent {
  private readonly service = inject(SettlementService);
  private readonly toast = inject(PsToastService);

  protected readonly statusTone = statusTone;
  protected readonly filters = FILTERS;

  protected readonly settlements = signal<Settlement[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly activeStatus = signal('');
  private loadGeneration = 0;
  protected readonly selected = signal<Set<string>>(new Set());
  protected readonly acting = signal(false);
  protected readonly dialog = signal<'mark' | 'cutoff' | null>(null);

  protected readonly batchRef = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, minTrimmedLength(3)],
  });

  protected readonly selectedCount = computed(() => this.selected().size);
  protected readonly allSelected = computed(() => {
    const rows = this.settlements();
    return rows.length > 0 && rows.every((r) => this.selected().has(r.id));
  });

  constructor() {
    this.load();
  }

  protected setStatus(status: string): void {
    if (this.activeStatus() === status) return;
    this.activeStatus.set(status);
    this.selected.set(new Set());
    this.load();
  }

  protected isSelected(id: string): boolean {
    return this.selected().has(id);
  }

  protected toggle(id: string, checked: boolean): void {
    this.selected.update((set) => {
      const next = new Set(set);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  protected toggleAll(checked: boolean): void {
    this.selected.set(checked ? new Set(this.settlements().map((s) => s.id)) : new Set());
  }

  protected openMark(): void {
    if (this.selectedCount() === 0) return;
    this.batchRef.reset('');
    this.dialog.set('mark');
  }

  protected openCutoff(): void {
    this.dialog.set('cutoff');
  }

  protected closeDialog(): void {
    if (this.acting()) return;
    this.dialog.set(null);
  }

  protected confirmMark(): void {
    if (this.batchRef.invalid) {
      this.batchRef.markAsTouched();
      return;
    }
    this.acting.set(true);
    this.service
      .markSettled({ settlement_ids: [...this.selected()], batch_payout_reference: this.batchRef.value.trim() })
      .subscribe({
        next: (res) => {
          this.toast.success(`${res.data?.settledCount ?? 0} settlement(s) marked settled.`);
          this.finishAction();
        },
        error: () => {
          this.acting.set(false);
          this.toast.error('Could not mark these settlements as settled. Please try again.');
        },
      });
  }

  protected confirmCutoff(): void {
    this.acting.set(true);
    this.service.triggerT1Cutoff().subscribe({
      next: (res) => {
        this.toast.success(`T+1 cutoff processed ${res.data?.processedCount ?? 0} settlement(s).`);
        this.finishAction();
      },
      error: () => {
        this.acting.set(false);
        this.toast.error('Could not trigger the T+1 cutoff. Please try again.');
      },
    });
  }

  private finishAction(): void {
    this.acting.set(false);
    this.dialog.set(null);
    this.selected.set(new Set());
    this.load();
  }

  protected retry(): void {
    this.load();
  }

  /** Exports the selected rows if any are checked, otherwise the whole current page/filter view. */
  protected exportCsv(): void {
    const selectedIds = this.selected();
    const rows = selectedIds.size > 0 ? this.settlements().filter((s) => selectedIds.has(s.id)) : this.settlements();
    exportToCsv(
      `settlements-${this.activeStatus() || 'all'}.csv`,
      rows.map((s) => ({
        id: s.id,
        reference: s.settlementReference,
        vendor: s.vendor?.businessName || s.vendorId,
        gross_amount: s.grossOrderAmount,
        fee: s.platformFeeDeduction,
        net_amount: s.netSettlementAmount,
        status: s.status,
        due_date: s.settlementDueDate ?? '',
        settled_at: s.settledAt ?? '',
        batch_payout_reference: s.batchPayoutReference ?? '',
      })),
    );
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    const generation = ++this.loadGeneration;
    this.service.list(this.activeStatus() || undefined).subscribe({
      next: (res) => {
        if (generation !== this.loadGeneration) return;
        this.settlements.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        if (generation !== this.loadGeneration) return;
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
