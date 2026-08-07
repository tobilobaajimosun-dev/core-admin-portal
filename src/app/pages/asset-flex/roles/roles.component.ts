import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { PlusSignIcon, PencilEdit02Icon } from '@hugeicons-pro/core-stroke-rounded';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';

import { RoleService } from '../shared/services/role.service';
import { Role } from '../shared/models/role.model';
import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { ModalShellComponent } from '@pages/asset-flex/shared/components/modal-shell/modal-shell.component';
import { KNOWN_PERMISSIONS, PERMISSION_CATALOG } from '../shared/utils/permission-catalog';
import { formatLabel } from '../shared/utils/format';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';

@Component({
  selector: 'app-roles',
  imports: [ReactiveFormsModule, HugeiconsIconComponent, PageHeaderComponent, ModalShellComponent, ErrorStateComponent],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesComponent {
  private readonly service = inject(RoleService);
  private readonly toast = inject(PsToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly addIcon = PlusSignIcon;
  protected readonly editIcon = PencilEdit02Icon;
  protected readonly catalog = PERMISSION_CATALOG;
  protected readonly roleLabel = formatLabel;

  protected readonly roles = signal<Role[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly dialogOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly editingId = signal<string | null>(null);

  /** Selected permission tokens (includes any preserved custom tokens). */
  protected readonly selected = signal<Set<string>>(new Set());
  /** Custom tokens on the edited role that aren't in the catalog. */
  protected readonly customTokens = signal<string[]>([]);

  protected readonly dialogTitle = computed(() => (this.editingId() ? 'Edit role' : 'New role'));

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  constructor() {
    this.load();
  }

  protected isSelected(token: string): boolean {
    return this.selected().has(token);
  }

  protected toggle(token: string, checked: boolean): void {
    this.selected.update((set) => {
      const next = new Set(set);
      if (checked) next.add(token);
      else next.delete(token);
      return next;
    });
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', description: '' });
    this.form.controls.name.enable();
    this.selected.set(new Set());
    this.customTokens.set([]);
    this.dialogOpen.set(true);
  }

  protected openEdit(role: Role): void {
    this.editingId.set(role.id);
    this.form.reset({ name: role.name, description: role.description ?? '' });
    // Role name tends to be the identifier; keep it read-only when editing system roles.
    if (role.isSystem) this.form.controls.name.disable();
    else this.form.controls.name.enable();
    this.selected.set(new Set(role.permissions));
    this.customTokens.set(role.permissions.filter((p) => !KNOWN_PERMISSIONS.has(p)));
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    if (this.saving()) return;
    this.dialogOpen.set(false);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const permissions = [...this.selected()];
    if (permissions.length === 0) {
      this.toast.error('Select at least one permission.');
      return;
    }

    const raw = this.form.getRawValue();
    this.saving.set(true);
    const editing = this.editingId();

    const req$ = editing
      ? this.service.update(editing, { description: raw.description || undefined, permissions })
      : this.service.create({ name: raw.name, description: raw.description || undefined, permissions });

    req$.subscribe({
      next: () => {
        this.toast.success(editing ? 'Role updated.' : 'Role created.');
        this.saving.set(false);
        this.dialogOpen.set(false);
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error(editing ? 'Could not update this role. Please try again.' : 'Could not create this role. Please try again.');
      },
    });
  }

  protected retry(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.service.list().subscribe({
      next: (res) => {
        this.roles.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
