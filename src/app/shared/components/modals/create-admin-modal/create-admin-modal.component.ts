import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  effect,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { PsCheckboxComponent } from '@pcsl-ui/ui/ps-checkbox/ps-checkbox.component';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';
import { AdminStore } from '@core/store/admin.store';
import { RoleStore } from '@core/store/role.store';
import { PermissionStore } from '@core/store/permission.store';
import { CreateAdminPayload } from '@core/interfaces/admin.model';
import { GroupedPermissionItem } from '@core/interfaces/permission.model';
import { SuccessNotificationModalComponent } from '../success-notification-modal/success-notification-modal.component';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';

@Component({
  selector: 'app-create-admin-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PsCheckboxComponent, PsSvgIconComponent],
  templateUrl: './create-admin-modal.component.html',
  styleUrl: './create-admin-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('expandDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' })),
      ]),
    ]),
  ],
})
export class CreateAdminModalComponent extends PsModalComponent implements OnInit, OnDestroy {

  isEditMode = false;
  private isSubmittingAction = false;
  private destroy$ = new Subject<void>();
  private modalService = inject(PsModalService);

  private initialPrefillDone = false;

  private readonly fb = inject(NonNullableFormBuilder);
  readonly adminStore = inject(AdminStore);
  readonly roleStore = inject(RoleStore);
  readonly permissionStore = inject(PermissionStore);

  roles = this.roleStore.roles;
  isLoadingRoles = this.roleStore.isLoading;
  groupedPermissions = this.permissionStore.groupedPermissions;
  isLoadingPermissions = this.permissionStore.isLoadingGrouped;
  isLoadingAdmin = this.adminStore.isLoadingAdmin;

  inviteForm: FormGroup = this.fb.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    roleId: ['', Validators.required],
    addCustomPermissions: [false],
  });

  get formControls() { return this.inviteForm.controls; }
  get isSubmitting(): boolean { return this.adminStore.isSubmitting(); }

  get groupedEntries(): [string, GroupedPermissionItem[]][] {
    return Object.entries(this.groupedPermissions());
  }

  constructor() {
    super();

    effect(() => {
      const grouped = this.groupedPermissions();
      if (Object.keys(grouped).length === 0) return;

      const adminId = this.data?.['adminId'];

      if (adminId) {
        const selectedAdmin = this.adminStore.selectedAdmin();
        if (!selectedAdmin) return;

        this.inviteForm.patchValue({
          firstname: selectedAdmin.first_name,
          lastname: selectedAdmin.last_name,
          email: selectedAdmin.email,
          roleId: selectedAdmin.role?.id ?? '',
        });

        const adminPermissionNames: string[] =
          (selectedAdmin.adminPermissions ?? []).map((ap) => ap.permission.name);

        const rolePermissionNames: string[] =
          (selectedAdmin.role?.rolePermissions ?? []).map((rp: any) => rp.permission.name);

        const hasCustomPermissions =
          adminPermissionNames.length !== rolePermissionNames.length ||
          adminPermissionNames.some((name) => !rolePermissionNames.includes(name));

        if (hasCustomPermissions) {
          this.inviteForm.patchValue({ addCustomPermissions: true }, { emitEvent: false });
        }

        this.syncPermissionControls(adminPermissionNames);
        this.initialPrefillDone = true;
      } else {
        this.syncPermissionControls([]);
        this.initialPrefillDone = true;
      }
    });

    effect(() => {
      const submitting = this.adminStore.isSubmitting();
      const error = this.adminStore.error();

      if (this.isSubmittingAction && !submitting) {
        this.isSubmittingAction = false;

        if (!error) {
          this.close();

          if (!this.isEditMode) {
            this.modalService.open(SuccessNotificationModalComponent, {
              data: {
                iconSrc: 'icons/invite-sent.svg',
                title: 'Invite sent',
                description: 'An invite has been sent to the email address',
                doneLabel: 'Done',
              },
            });
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.roleStore.fetchAllRoles({ page: 1, limit: 100 });
    this.permissionStore.fetchGroupedPermissions();

    if (this.data?.['adminId']) {
      this.isEditMode = true;
      this.adminStore.fetchAdminById(this.data['adminId']);
    }

    this.inviteForm.get('roleId')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedRoleId: string) => {
        // Skip during initial prefill — the effect handles that
        if (!this.initialPrefillDone) return;
        if (!selectedRoleId) return;

        const selectedRole = this.roles().find((r) => r.id === selectedRoleId);
        const rolePermissions: string[] =
          (selectedRole?.rolePermissions ?? []).map((rp: any) => rp.permission.name);

        this.syncPermissionControls(rolePermissions);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Permission helpers ──────────────────────────────────────────────────────

  private syncPermissionControls(existingPermissions: string[]): void {
    const allPerms = Object.values(this.groupedPermissions()).flat();
    allPerms.forEach((perm) => {
      const isChecked = existingPermissions.includes(perm.name);
      if (this.inviteForm.contains(perm.id)) {
        this.inviteForm.get(perm.id)?.setValue(isChecked, { emitEvent: false });
      } else {
        this.inviteForm.addControl(
          perm.id,
          new FormControl(isChecked, { nonNullable: true })
        );
      }
    });
  }

  isPermissionChecked(permissionId: string): boolean {
    return this.inviteForm.get(permissionId)?.value ?? false;
  }

  onPermissionChange(checked: boolean, controlKey: string): void {
    this.inviteForm.get(controlKey)?.setValue(checked);
  }

  private getSelectedPermissionIds(): string[] {
    const allPerms = Object.values(this.groupedPermissions()).flat();
    return allPerms
      .filter((perm) => this.inviteForm.get(perm.id)?.value === true)
      .map((perm) => perm.id);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  handleSendInvite(): void {
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }

    const { firstname, lastname, email, roleId, addCustomPermissions } =
      this.inviteForm.getRawValue();
    let permissionIds: string[];
    if (addCustomPermissions) {
      permissionIds = this.getSelectedPermissionIds();
    } else {
      const selectedRole = this.roles().find((r) => r.id === roleId);
      permissionIds = (selectedRole?.rolePermissions ?? []).map((rp: any) => rp.permission.id);
    }

    const payload: CreateAdminPayload = {
      email,
      first_name: firstname,
      last_name: lastname,
      roleId,
      permissionIds,
    };

    this.adminStore.clearError();
    this.isSubmittingAction = true;

    if (this.isEditMode) {
      const adminId = this.data?.['adminId'] ?? this.adminStore.selectedAdmin()?.id;
      if (!adminId) { this.isSubmittingAction = false; return; }
      this.adminStore.updateAdmin({ id: adminId, payload });
    } else {
      this.adminStore.createAdmin(payload);
    }
  }
}