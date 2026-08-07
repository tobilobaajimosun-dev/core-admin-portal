import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { PlusSignIcon, PencilEdit02Icon, UserRemove01Icon } from '@hugeicons-pro/core-stroke-rounded';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';

import { AdminUserService } from '../shared/services/admin-user.service';
import { RoleService } from '../shared/services/role.service';
import { AdminUser, AdminUserStatus } from '../shared/models/admin-user.model';
import { Role } from '../shared/models/role.model';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { statusTone } from '../shared/utils/status-tone';
import { formatLabel } from '../shared/utils/format';
import { applyServerErrors } from '../shared/utils/apply-server-errors';
import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { ModalShellComponent } from '@pages/asset-flex/shared/components/modal-shell/modal-shell.component';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '@pages/asset-flex/shared/components/empty-state/empty-state.component';

const STATUSES: AdminUserStatus[] = ['ACTIVE', 'SUSPENDED', 'INACTIVE'];

@Component({
  selector: 'app-admin-users',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    HugeiconsIconComponent,
    StatusBadgeComponent,
    PageHeaderComponent,
    ModalShellComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent {
  private readonly service = inject(AdminUserService);
  private readonly roleService = inject(RoleService);
  private readonly toast = inject(PsToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly addIcon = PlusSignIcon;
  protected readonly editIcon = PencilEdit02Icon;
  protected readonly removeIcon = UserRemove01Icon;
  protected readonly statuses = STATUSES;
  protected readonly statusTone = statusTone;
  protected readonly roleLabel = formatLabel;

  protected readonly users = signal<AdminUser[]>([]);
  protected readonly roles = signal<Role[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly saving = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly deactivating = signal<AdminUser | null>(null);

  protected readonly formOpen = computed(() => this.mode() !== null);
  protected readonly mode = signal<'create' | 'edit' | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['', Validators.required],
    status: ['ACTIVE' as AdminUserStatus],
  });

  constructor() {
    this.load();
    this.roleService.list().subscribe({ next: (res) => this.roles.set(res.data ?? []) });
  }

  protected fullName(u: AdminUser): string {
    return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email;
  }

  protected initials(u: AdminUser): string {
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || u.email[0]?.toUpperCase() || '?';
  }

  protected errorFor(
    control: 'first_name' | 'last_name' | 'email' | 'password' | 'role' | 'status',
  ): string | null {
    const ctrl = this.form.controls[control];
    if (!ctrl.touched || ctrl.valid) return null;
    if (ctrl.hasError('server')) return ctrl.getError('server');
    if (ctrl.hasError('required')) return 'This field is required.';
    if (ctrl.hasError('email')) return 'Enter a valid email address.';
    if (ctrl.hasError('minlength')) return 'Must be at least 8 characters.';
    return 'This field is invalid.';
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.mode.set('create');
    this.form.reset({ first_name: '', last_name: '', email: '', password: '', role: '', status: 'ACTIVE' });
    this.form.controls.email.enable();
    this.form.controls.password.enable();
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.controls.password.updateValueAndValidity();
  }

  protected openEdit(u: AdminUser): void {
    this.editingId.set(u.id);
    this.mode.set('edit');
    this.form.reset({
      first_name: u.firstName,
      last_name: u.lastName,
      email: u.email,
      password: '',
      role: u.role,
      status: u.status,
    });
    this.form.controls.email.disable();
    // Password optional on edit.
    this.form.controls.password.setValidators([Validators.minLength(8)]);
    this.form.controls.password.updateValueAndValidity();
  }

  protected closeForm(): void {
    if (this.saving()) return;
    this.mode.set(null);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const editing = this.editingId();

    const onError = (err: unknown) => {
      const msg = applyServerErrors(this.form, err);
      if (msg) this.toast.error(msg);
      this.saving.set(false);
    };
    const onDone = (message: string) => {
      this.toast.success(message);
      this.saving.set(false);
      this.mode.set(null);
      this.load();
    };

    if (editing) {
      this.service
        .update(editing, {
          first_name: v.first_name,
          last_name: v.last_name,
          role: v.role,
          status: v.status,
          ...(v.password ? { password: v.password } : {}),
        })
        .subscribe({ next: () => onDone('Admin user updated.'), error: onError });
    } else {
      this.service
        .create({
          email: v.email,
          password: v.password,
          role: v.role,
          first_name: v.first_name,
          last_name: v.last_name,
          status: v.status,
        })
        .subscribe({ next: () => onDone('Admin user created.'), error: onError });
    }
  }

  protected confirmDeactivate(): void {
    const user = this.deactivating();
    if (!user) return;
    this.saving.set(true);
    this.service.deactivate(user.id).subscribe({
      next: () => {
        this.toast.success('Admin user deactivated.');
        this.saving.set(false);
        this.deactivating.set(null);
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Could not deactivate this admin user. Please try again.');
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
        this.users.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
