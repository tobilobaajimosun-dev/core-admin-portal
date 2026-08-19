import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Add01Icon } from '@hugeicons-pro/core-stroke-rounded';
import { PaymentMethodService } from '../shared/services/payment-method.service';
import { PaymentMethod } from '../shared/models/payment-method.model';
import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { ModalShellComponent } from '@pages/asset-flex/shared/components/modal-shell/modal-shell.component';
import { SelectComponent } from '@pages/asset-flex/shared/components/select/select.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '@pages/asset-flex/shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-payment-methods',
  imports: [
    ReactiveFormsModule,
    HugeiconsIconComponent,
    PageHeaderComponent,
    ModalShellComponent,
    SelectComponent,
    StatusBadgeComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  templateUrl: './payment-methods.component.html',
  styleUrl: './payment-methods.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodsComponent {
  private readonly service = inject(PaymentMethodService);
  private readonly route = inject(ActivatedRoute);
  protected readonly methods = signal<PaymentMethod[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  /**
   * Prototype "Add payment method" flow — /admin/payment-methods is GET-only
   * (confirmed via the live Swagger spec); admins can link an existing method
   * to a loan product but can't create a new method type. This adds to the
   * in-memory list only, never a real request — rows carry a "Demo" badge and
   * vanish on reload.
   */
  protected readonly addIcon = Add01Icon;
  protected readonly addOpen = signal(false);
  protected readonly prototypeCodes = signal<Set<string>>(new Set());
  protected readonly addForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    paymentType: new FormControl('Salary', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
  });
  protected readonly typeOptions = [
    { label: 'Salary', value: 'Salary' },
    { label: 'Direct Debit', value: 'Direct Debit' },
  ];

  constructor() {
    this.load();
    if (this.route.snapshot.queryParamMap.get('add') === '1') this.openAdd();
  }

  protected retry(): void {
    this.load();
  }

  protected isPrototype(code: string): boolean {
    return this.prototypeCodes().has(code);
  }

  protected openAdd(): void {
    this.addForm.reset({ name: '', code: '', paymentType: 'Salary', description: '' });
    this.addOpen.set(true);
  }

  protected closeAdd(): void {
    this.addOpen.set(false);
  }

  protected submitAdd(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const v = this.addForm.getRawValue();
    const method: PaymentMethod = {
      code: v.code,
      name: v.name,
      description: v.description || null,
      paymentType: v.paymentType,
    };
    this.prototypeCodes.update((codes) => new Set(codes).add(method.code));
    this.methods.update((rows) => [method, ...rows]);
    this.addOpen.set(false);
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.service.list().subscribe({
      next: (res) => {
        this.methods.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
