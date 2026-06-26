import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';

@Component({
  selector: 'app-locked-out-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './locked-out-modal.component.html',
  styleUrl: './locked-out-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LockedOutModalComponent extends PsModalComponent {
  /** Duration of the lockout period displayed to the user (default: 15 minutes). */
  @Input() lockoutMinutes = 15;

  onResetPassword(): void {
    // TODO: navigate to / open the reset-password flow, e.g.:
    // this.router.navigate(['/reset-password']);
    // or open the ResetPasswordModalComponent via a modal service.
    this.close();
  }
}