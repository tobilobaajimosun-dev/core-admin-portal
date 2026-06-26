import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';

export interface DeleteModalData {
  title: string;
  description: string;
  fieldLabel: string;
  fieldPlaceholder: string;
  confirmationValue: string;   // the exact value user must type to confirm
  deleteButtonLabel: string;
  onConfirm: () => void;       // callback executed on confirmed delete
}

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteModalComponent extends PsModalComponent implements OnInit {

  private modalService = inject(PsModalService);

  confirmationText = '';

  modalData: DeleteModalData = {
    title: '',
    description: '',
    fieldLabel: '',
    fieldPlaceholder: '',
    confirmationValue: '',
    deleteButtonLabel: 'Delete',
    onConfirm: () => {},
  };

  ngOnInit(): void {
    if (this.data) {
      this.modalData = { ...this.modalData, ...this.data };
    }
  }

 get isMatch(): boolean {
  return this.confirmationText.trim().length > 0 &&
    this.confirmationText.trim().toLowerCase() ===
    this.modalData.confirmationValue.trim().toLowerCase();
} 

  onDelete(): void {
    if (!this.isMatch) return;
    this.modalData.onConfirm();
    this.close();
  }
}