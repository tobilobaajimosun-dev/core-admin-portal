import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { PlusSignIcon, PencilEdit02Icon, Delete02Icon } from '@hugeicons-pro/core-stroke-rounded';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';

import { LoanProductService } from '../shared/services/loan-product.service';
import { CaltosCatalogItem, LoanProduct } from '../shared/models/loan-product.model';
import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { ModalShellComponent } from '@pages/asset-flex/shared/components/modal-shell/modal-shell.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { NairaPipe } from '../shared/pipes/naira.pipe';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '@pages/asset-flex/shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-loan-products',
  imports: [
    ReactiveFormsModule,
    HugeiconsIconComponent,
    PageHeaderComponent,
    ModalShellComponent,
    StatusBadgeComponent,
    NairaPipe,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  templateUrl: './loan-products.component.html',
  styleUrl: './loan-products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanProductsComponent {
  private readonly service = inject(LoanProductService);
  private readonly toast = inject(PsToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly addIcon = PlusSignIcon;
  protected readonly editIcon = PencilEdit02Icon;
  protected readonly deleteIcon = Delete02Icon;

  protected readonly products = signal<LoanProduct[]>([]);
  protected readonly catalog = signal<CaltosCatalogItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly saving = signal(false);
  protected readonly togglingId = signal<string | null>(null);
  protected readonly mode = signal<'create' | 'edit' | null>(null);
  protected readonly editingId = signal<string | null>(null);
  protected readonly deleting = signal<LoanProduct | null>(null);

  protected readonly dialogOpen = computed(() => this.mode() !== null);

  protected readonly createForm = this.fb.nonNullable.group({
    caltos_product_id: ['', Validators.required],
    code: ['', Validators.required],
  });

  protected readonly editForm = this.fb.nonNullable.group({
    code: ['', Validators.required],
    isActive: [true],
    autoDisburse: [false],
  });

  constructor() {
    this.load();
  }

  protected catalogLabel(item: CaltosCatalogItem): string {
    return (item.name as string) || (item.code as string) || item.id;
  }

  protected openCreate(): void {
    this.mode.set('create');
    this.editingId.set(null);
    this.createForm.reset({ caltos_product_id: '', code: '' });
    if (this.catalog().length === 0) {
      this.service.caltosCatalog().subscribe({ next: (res) => this.catalog.set(res.data ?? []) });
    }
  }

  protected openEdit(p: LoanProduct): void {
    this.mode.set('edit');
    this.editingId.set(p.id);
    this.editForm.reset({ code: p.code, isActive: p.isActive, autoDisburse: p.autoDisburse });
  }

  protected closeDialog(): void {
    if (this.saving()) return;
    this.mode.set(null);
  }

  protected save(): void {
    const editing = this.editingId();
    if (editing) {
      if (this.editForm.invalid) return this.editForm.markAllAsTouched();
      const v = this.editForm.getRawValue();
      this.saving.set(true);
      this.service.update(editing, v).subscribe({
        next: () => this.done('Loan product updated.'),
        error: () => {
          this.saving.set(false);
          this.toast.error('Could not update this loan product. Please try again.');
        },
      });
    } else {
      if (this.createForm.invalid) return this.createForm.markAllAsTouched();
      const v = this.createForm.getRawValue();
      this.saving.set(true);
      this.service.create({ caltos_product_id: v.caltos_product_id, code: v.code, product_code: v.code }).subscribe({
        next: () => this.done('Loan product created.'),
        error: () => {
          this.saving.set(false);
          this.toast.error('Could not create this loan product. Please try again.');
        },
      });
    }
  }

  protected toggleAutoDisburse(p: LoanProduct): void {
    this.togglingId.set(p.id);
    this.service.setAutoDisburse(p.id, !p.autoDisburse).subscribe({
      next: () => {
        this.toast.success(`Auto-disburse ${!p.autoDisburse ? 'enabled' : 'disabled'}.`);
        this.togglingId.set(null);
        this.load();
      },
      error: () => {
        this.togglingId.set(null);
        this.toast.error('Could not change auto-disburse for this loan product. Please try again.');
      },
    });
  }

  protected confirmDelete(): void {
    const p = this.deleting();
    if (!p) return;
    this.saving.set(true);
    this.service.remove(p.id).subscribe({
      next: () => {
        this.toast.success('Loan product deleted.');
        this.saving.set(false);
        this.deleting.set(null);
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Could not delete this loan product. Please try again.');
      },
    });
  }

  protected retry(): void {
    this.load();
  }

  private done(message: string): void {
    this.toast.success(message);
    this.saving.set(false);
    this.mode.set(null);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.service.list().subscribe({
      next: (res) => {
        this.products.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
