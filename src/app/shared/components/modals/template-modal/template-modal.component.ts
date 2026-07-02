import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';
import { NotificationStore } from '@core/store/notification.store';
import { NotificationTemplateRaw } from '@core/interfaces/notification.model';

const AVAILABLE_VARIABLES = [
  '{{customerName}}',
  '{{amount}}',
  '{{balance}}',
  '{{dueDate}}',
  '{{loanId}}',
];

const CHANNEL_OPTIONS: { label: string; value: string }[] = [
  { label: 'Email', value: 'email' },
  { label: 'In App',  value: 'push'  },
  { label: 'SMS',   value: 'sms'   },
];

@Component({
  selector: 'app-template-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './template-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateModalComponent extends PsModalComponent implements OnInit {
  private readonly fb    = inject(NonNullableFormBuilder);
  private readonly store = inject(NotificationStore);

  isEditMode   = false;
  isSubmitting = this.store.isSavingTemplate;
  submitError  = this.store.saveTemplateError;

  readonly availableVariables = AVAILABLE_VARIABLES;
  readonly channelOptions     = CHANNEL_OPTIONS;

  templateForm = this.fb.group({
    slug:    ['', Validators.required],
    channel: ['email', Validators.required],
    subject: ['', Validators.required],
    body:    ['', Validators.required],
  });

  get formControls() {
    return this.templateForm.controls;
  }

  ngOnInit(): void {
    const template: NotificationTemplateRaw | undefined = this.data?.['template'];

    if (template) {
      this.isEditMode = true;

      // slug + channel together identify the template record — locking
      // both on edit avoids accidentally creating a duplicate under a
      // different slug/channel pair instead of updating the existing one.
      this.templateForm.get('slug')?.disable();
      this.templateForm.get('channel')?.disable();

      this.templateForm.patchValue({
        slug:    template.slug,
        channel: template.channel,
        subject: template.subject ?? '',
        body:    template.body,
      });
    }
  }

  insertVariable(variable: string): void {
    const ctrl = this.templateForm.get('body')!;
    const current = ctrl.value ?? '';
    const combined = current + variable;
    ctrl.setValue(combined.length > 500 ? combined.slice(0, 500) : combined);
  }

  handleSubmit(): void {
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      return;
    }

    const { slug, channel, subject, body } = this.templateForm.getRawValue();

    // Derive the bare variable names from {{tokens}} in the body — the API
    // wants ["customerName"], not ["{{customerName}}"].
    const variables = Array.from(
      new Set(
        [...body.matchAll(/\{\{\s*([\w]+)\s*\}\}/g)].map((m) => m[1])
      )
    );

    this.store.createTemplate({ slug, channel, subject, body, variables })
      .subscribe({
        next: () => this.close(),
        // On error, isSubmitting resets via the store and submitError is
        // populated — the modal stays open so the person can retry.
        error: () => {},
      });
  }
}