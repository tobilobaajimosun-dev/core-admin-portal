import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';

@Component({
  selector: 'app-refund-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './refund-confirm-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RefundConfirmModalComponent extends PsModalComponent {
  get amount(): number {
    return this.data?.['amount'] ?? 0;
  }

  cancel(): void {
    this.close();
  }

  confirmRefund(): void {
    const onConfirm = this.data?.['onConfirm'] as (() => void) | undefined;
    onConfirm?.();
    this.close();
  }
}