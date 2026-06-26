import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { UpdateInfoModalComponent } from '@shared/components/modals/update-info-modal/update-info-modal.component';
import { ConfirmModalComponent } from '@shared/components/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PsSvgIconComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {

  private fb           = inject(NonNullableFormBuilder);
  private modalService = inject(PsModalService);

  profileForm = this.fb.group({
    firstname: ['Jesulademi'],
    lastname:  ['Ajimosun'],
    email:     ['jesulademi.ajimosun@princepsfinance.com'],
    role:      ['BSSTO'],
  });

  getInitials(): string {
    const first = this.profileForm.get('firstname')?.value?.charAt(0) ?? '';
    const last  = this.profileForm.get('lastname')?.value?.charAt(0)  ?? '';
    return (first + last).toUpperCase();
  }

  openUpdateModal(): void {
    this.modalService.open(UpdateInfoModalComponent, {
      maxWidth: '560px',
      isCentered: true,
      data: {
        firstname: this.profileForm.get('firstname')?.value,
        lastname:  this.profileForm.get('lastname')?.value,
      },
    });
  }

  openRemoveImageModal(): void {
  this.modalService.open(ConfirmModalComponent, {
    maxWidth: '520px',
    isCentered: true,
    data: {
      title: 'Remove image?',
      description: 'Are you sure you want to remove this image? This action cannot be undone.',
      confirmButtonLabel: 'Yes, remove image',
      onConfirm: () => {
      },
    },
  });
}
}