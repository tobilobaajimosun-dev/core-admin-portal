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
  protected readonly activeStatus = signal('');
  protected readonly selected = signal<Set<string>>(new Set());
  protected readonly acting = signal(false);
  protected readonly dialog = signal<'mark' | 'cutoff' | null>(null);

  protected readonly batchRef = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
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
      .markSettled({ settlement_ids: [...this.selected()], batch_payout_reference: this.batchRef.value })
      .subscribe({
        next: (res) => {
          this.toast.success(`${res.data?.settledCount ?? 0} settlement(s) marked settled.`);
          this.finishAction();
        },
        error: () => this.acting.set(false),
      });
  }

  protected confirmCutoff(): void {
    this.acting.set(true);
    this.service.triggerT1Cutoff().subscribe({
      next: (res) => {
        this.toast.success(`T+1 cutoff processed ${res.data?.processedCount ?? 0} settlement(s).`);
        this.finishAction();
      },
      error: () => this.acting.set(false),
    });
  }

  private finishAction(): void {
    this.acting.set(false);
    this.dialog.set(null);
    this.selected.set(new Set());
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.service.list(this.activeStatus() || undefined).subscribe({
      next: (res) => {
        this.settlements.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.settlements.set([]);
        this.loading.set(false);
      },
    });
  }
}
