import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { PsModalComponent } from "@pcsl-ui/ui/ps-modal/ps-modal.component";

export interface ConfirmModalData {
  title: string;
  description: string;
  confirmButtonLabel: string;
  cancelButtonLabel?: string; 
  onConfirm: () => void;
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent extends PsModalComponent implements OnInit {
  modalData: ConfirmModalData = {
    title: '',
    description: '',
    confirmButtonLabel: 'Confirm',
    cancelButtonLabel: 'Cancel',
    onConfirm: () => {},
  };

  ngOnInit(): void {
    if (this.data) {
      this.modalData = { ...this.modalData, ...this.data };
    }
  }

  onConfirm(): void {
    this.modalData.onConfirm();
    this.close();
  }
}