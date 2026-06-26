import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FreezeWalletData {
  walletId:     string;
  walletHolder: string;
  isFrozen:     boolean;
  onConfirm:    () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-freeze-wallet-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './freeze-wallet-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FreezeWalletModalComponent extends PsModalComponent implements OnInit {

  modalData: FreezeWalletData = {
    walletId:     '',
    walletHolder: '',
    isFrozen:     false,
    onConfirm:    () => {},
  };

  ngOnInit(): void {
    if (this.data) {
      this.modalData = { ...this.modalData, ...this.data };
    }
  }

  submit(): void {
    this.modalData.onConfirm();
    this.close();
  }
}