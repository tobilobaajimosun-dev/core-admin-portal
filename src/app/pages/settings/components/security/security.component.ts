import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { ChangePasswordModalComponent } from '@shared/components/modals/change-password-modal/change-password-modal.component';
// import { ChangePasswordModalComponent } from '@shared/components/modals/change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './security.component.html',
  styleUrl: './security.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecurityComponent {

  private modalService = inject(PsModalService);

 openChangePasswordModal(): void {
  this.modalService.open(ChangePasswordModalComponent, {
    maxWidth: '520px',
    isCentered: true,
  });
}
}