import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PaymentMethod } from '../../shared/models/payment-method.model';
import { ModalShellComponent } from '@pages/asset-flex/shared/components/modal-shell/modal-shell.component';

/**
 * Standalone "add payment method" modal — hostable on the dashboard. Prototype
 * only: /admin/payment-methods is GET-only, so this never persists. Emits the
 * composed method so the host can show it (with a "Demo" marker) or just toast.
 */
@Component({
  selector: 'af-payment-method-create-modal',
  imports: [ReactiveFormsModule, ModalShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal-shell title="Add payment method" maxWidth="440px" (closed)="closed.emit()">
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="form" id="pm-create-modal">
        <div class="pa-field">
          <label class="pa-field__label" for="pmc-name">Name</label>
          <input id="pmc-name" class="pa-input" type="text" formControlName="name" placeholder="Opay Direct Debit" />
        </div>
        <div class="pa-field">
          <label class="pa-field__label" for="pmc-code">Code</label>
          <input id="pmc-code" class="pa-input" type="text" formControlName="code" placeholder="OPAY_DD" />
        </div>
        <div class="pa-field">
          <label class="pa-field__label" for="pmc-type">Type</label>
          <select id="pmc-type" class="pa-select" formControlName="paymentType">
            <option value="Salary">Salary</option>
            <option value="Direct Debit">Direct Debit</option>
          </select>
        </div>
        <div class="pa-field">
          <label class="pa-field__label" for="pmc-desc">Description</label>
          <input id="pmc-desc" class="pa-input" type="text" formControlName="description" />
        </div>
      </form>
      <p class="pmc-note">Prototype — the admin API can't create payment methods yet, so this won't persist.</p>
      <ng-container modalFooter>
        <button class="pa-btn pa-btn--white pa-btn--sm" type="button" (click)="closed.emit()">Cancel</button>
        <button class="pa-btn pa-btn--primary pa-btn--sm" type="submit" form="pm-create-modal">Add method</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [`.pmc-note { font-size: 12px; color: var(--ca-text-faint); margin: 8px 0 0; }`],
})
export class PaymentMethodCreateModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly closed = output<void>();
  readonly created = output<PaymentMethod>();

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    paymentType: ['Salary'],
    description: [''],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.created.emit({ code: v.code, name: v.name, description: v.description || null, paymentType: v.paymentType });
  }
}
