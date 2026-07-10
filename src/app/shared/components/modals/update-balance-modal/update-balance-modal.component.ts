import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';

// ── Types ──────────────────────────────────────────────────────────────────────

export type UpdateBalanceAction = 'credit' | 'debit';

export interface UpdateBalanceData {
  walletId:     string;
  walletHolder: string;
  onUpdate: (
    action: UpdateBalanceAction,
    amount: number,
    reason: string
  ) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-update-balance-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-balance-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateBalanceModalComponent extends PsModalComponent implements OnInit {

  modalData: UpdateBalanceData = {
    walletId:     '',
    walletHolder: '',
    onUpdate:     () => {},
  };

  // ── State ──────────────────────────────────────────────────────────────────
  selectedAction = signal<UpdateBalanceAction>('credit');
  amount         = signal('');
  reason         = signal('');

  // ── Validation ─────────────────────────────────────────────────────────────
  canSubmit = computed(() => {
    const amt = Number(this.amount().replace(/,/g, ''));
    return (
      !isNaN(amt) &&
      amt > 0 &&
      this.reason().trim().length > 0
    );
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    if (this.data) {
      this.modalData = { ...this.modalData, ...this.data };
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  selectAction(action: UpdateBalanceAction): void {
    this.selectedAction.set(action);
  }

  onAmountChange(value: string): void {
    const digits    = value.replace(/[^0-9]/g, '');
    const formatted = digits ? Number(digits).toLocaleString('en-NG') : '';
    this.amount.set(formatted);
  }

  onReasonChange(value: string): void {
    this.reason.set(value);
  }

  submit(): void {
    if (!this.canSubmit()) return;
    const amt = Number(this.amount().replace(/,/g, ''));
    this.modalData.onUpdate(this.selectedAction(), amt, this.reason().trim());
    this.close();
  }
}