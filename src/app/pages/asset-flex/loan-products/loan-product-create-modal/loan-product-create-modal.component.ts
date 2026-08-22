import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';

import { LoanProductService } from '../../shared/services/loan-product.service';
import { CaltosCatalogItem, LoanProduct } from '../../shared/models/loan-product.model';
import { ModalShellComponent } from '@pages/asset-flex/shared/components/modal-shell/modal-shell.component';
import { SelectComponent } from '@pages/asset-flex/shared/components/select/select.component';

/**
 * Standalone "create loan product" modal — hostable anywhere (e.g. the dashboard
 * quick action) without navigating to the loan-products page. Mirrors the page's
 * own create path; the page keeps its combined create/edit modal.
 */
@Component({
  selector: 'af-loan-product-create-modal',
  imports: [ReactiveFormsModule, ModalShellComponent, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal-shell title="New loan product" [dismissable]="!saving()" maxWidth="460px" (closed)="closed.emit()">
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="form" id="lp-create-modal">
        <div class="pa-field">
          <label class="pa-field__label" for="lpc-caltos">Caltos product</label>
          <af-select
            inputId="lpc-caltos"
            formControlName="caltos_product_id"
            [options]="catalogOptions()"
            [searchable]="true"
            placeholder="Select from catalog"
            searchPlaceholder="Search loan products…"
          />
        </div>
        <div class="pa-field">
          <label class="pa-field__label" for="lpc-code">Product code</label>
          <input id="lpc-code" class="pa-input" type="text" formControlName="code" placeholder="PROD_SAL_FLEX_3M" />
        </div>
      </form>
      <ng-container modalFooter>
        <button class="pa-btn pa-btn--white pa-btn--sm" type="button" (click)="closed.emit()" [disabled]="saving()">Cancel</button>
        <button class="pa-btn pa-btn--primary pa-btn--sm" type="submit" form="lp-create-modal" [disabled]="saving()">
          {{ saving() ? 'Saving…' : 'Create product' }}
        </button>
      </ng-container>
    </app-modal-shell>
  `,
})
export class LoanProductCreateModalComponent {
  private readonly service = inject(LoanProductService);
  private readonly toast = inject(PsToastService);
  private readonly fb = inject(FormBuilder);

  readonly closed = output<void>();
  readonly created = output<LoanProduct>();

  protected readonly saving = signal(false);
  protected readonly catalog = signal<CaltosCatalogItem[]>([]);
  protected readonly catalogOptions = computed(() =>
    this.catalog().map((item) => ({ label: this.catalogLabel(item), value: item.id })),
  );
  protected readonly form = this.fb.nonNullable.group({
    caltos_product_id: ['', Validators.required],
    code: ['', Validators.required],
  });

  constructor() {
    this.service.caltosCatalog().subscribe({
      next: (res) => this.catalog.set(Array.isArray(res.data) ? res.data : []),
      error: () => this.catalog.set([]),
    });
  }

  protected catalogLabel(item: CaltosCatalogItem): string {
    return (item.name as string) || (item.code as string) || item.id;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.service.create({ caltos_product_id: v.caltos_product_id, code: v.code, product_code: v.code }).subscribe({
      next: (res) => {
        this.toast.success('Loan product created.');
        this.saving.set(false);
        this.created.emit(res.data as LoanProduct);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Could not create this loan product. Please try again.');
      },
    });
  }
}
