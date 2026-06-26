import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';

@Component({
  selector: 'app-success-notification-modal',
  imports: [],
  templateUrl: './success-notification-modal.component.html',
  styleUrl: './success-notification-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessNotificationModalComponent extends PsModalComponent {
  get iconSrc(): string    { return this.data?.['iconSrc'] ?? ''; }
  get title(): string      { return this.data?.['title'] ?? ''; }
  get description(): string { return this.data?.['description'] ?? ''; }
  get doneLabel(): string  { return this.data?.['doneLabel'] ?? 'Done'; }
}
