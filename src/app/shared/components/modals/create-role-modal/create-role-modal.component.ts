import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  effect,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PsCheckboxComponent } from '@pcsl-ui/ui/ps-checkbox/ps-checkbox.component';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';
import { RoleStore } from '@core/store/role.store';
import { PermissionStore } from '@core/store/permission.store';
import { CreateRolePayload, UpdateRolePayload } from '@core/interfaces/role.model';
import { GroupedPermissionItem } from '@core/interfaces/permission.model';

@Component({
  selector: 'app-create-role-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PsCheckboxComponent],
  templateUrl: './create-role-modal.component.html',
  styleUrl: './create-role-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRoleModalComponent extends PsModalComponent implements OnInit {

  fb = inject(NonNullableFormBuilder);
  roleStore = inject(RoleStore);
  permissionStore = inject(PermissionStore);

  isEditMode = false;
  private isSubmittingAction = false;

  groupedPermissions = this.permissionStore.groupedPermissions;
  isLoadingPermissions = this.permissionStore.isLoadingGrouped;

  createRoleForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  get formControls() { return this.createRoleForm.controls; }
  get isViewMode(): boolean { return this.data?.['viewMode'] === true; }
  get isSubmitting(): boolean { return this.roleStore.isSubmitting(); }
  get isLoadingRole(): boolean { return this.roleStore.isLoadingRole(); }

  get groupedEntries(): [string, GroupedPermissionItem[]][] {
    return Object.entries(this.groupedPermissions());
  }

  constructor() {
    super();

    // Populate form fields when role is fetched (edit / view mode)
    effect(() => {
      const role = this.roleStore.selectedRole();
      if (!role || !this.data?.['roleId']) return;

      this.createRoleForm.patchValue({
        name: role.name,
        description: role.description ?? '',
      });

      if (this.isViewMode) {
        this.createRoleForm.disable();
      }
    });

    // Sync permission checkboxes once BOTH grouped permissions AND the role are ready.
    // For create mode there is no roleId, so we skip waiting for selectedRole.
    effect(() => {
      const grouped = this.groupedPermissions();
      if (Object.keys(grouped).length === 0) return;

      const roleId = this.data?.['roleId'];

      if (roleId) {
        // Edit / View: wait until the role has been fetched
        const selectedRole = this.roleStore.selectedRole();
        if (!selectedRole) return;

        const existingPermissions = (selectedRole.rolePermissions ?? []).map((p) => p.permission.name);
        this.syncPermissionControls(existingPermissions);
      } else {
        // Create: no pre-selected permissions
        this.syncPermissionControls([]);
      }
    });

    // Close modal once store finishes submitting (only if WE triggered it)
    effect(() => {
      const submitting = this.roleStore.isSubmitting();
      const error = this.roleStore.error();

      if (this.isSubmittingAction && !submitting) {
        this.isSubmittingAction = false;
        if (!error) this.close();
      }
    });
  }

  ngOnInit(): void {
    this.permissionStore.fetchGroupedPermissions();

    if (this.data?.['roleId']) {
      this.isEditMode = !this.data['viewMode'];
      // Fetch fresh role data — effects above will populate form + permissions
      this.roleStore.fetchRoleById(this.data['roleId']);
    }
  }

  // ── Permission helpers ──────────────────────────────────────────────────────

  private syncPermissionControls(existingPermissions: string[]): void {
    const allPerms = Object.values(this.groupedPermissions()).flat();

    allPerms.forEach((perm) => {
      const isChecked = existingPermissions.includes(perm.name);

      if (this.createRoleForm.contains(perm.id)) {
        this.createRoleForm.get(perm.id)?.setValue(isChecked, { emitEvent: false });
      } else {
        this.createRoleForm.addControl(
          perm.id,
          new FormControl(isChecked, { nonNullable: true })
        );
      }

      if (this.isViewMode) {
        this.createRoleForm.get(perm.id)?.disable({ emitEvent: false });
      }
    });
  }

  isPermissionChecked(permissionId: string): boolean {
    return this.createRoleForm.get(permissionId)?.value ?? false;
  }

  onPermissionChange(checked: boolean, permissionId: string): void {
    this.createRoleForm.get(permissionId)?.setValue(checked);
  }

  getSelectedPermissionIds(): string[] {
    const allPerms = Object.values(this.groupedPermissions()).flat();
    return allPerms
      .filter((perm) => this.createRoleForm.get(perm.id)?.value === true)
      .map((perm) => perm.id);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  handleSubmit(): void {
    if (this.createRoleForm.invalid) {
      this.createRoleForm.markAllAsTouched();
      return;
    }

    const { name, description } = this.createRoleForm.getRawValue();
    const permissionIds = this.getSelectedPermissionIds();

    this.roleStore.clearError();
    this.isSubmittingAction = true;

    if (this.isEditMode) {
      const roleId = this.data?.['roleId'];
      if (!roleId) {
        console.error('Edit mode active but roleId is missing');
        this.isSubmittingAction = false;
        return;
      }
      const payload: UpdateRolePayload = { name, description, permissionIds };
      this.roleStore.updateRole({ id: roleId, payload });
    } else {
      const payload: CreateRolePayload = { name, description, permissionIds };
      this.roleStore.createRole(payload);
    }
  }
}