import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
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
import { PsSelectModule } from '@pcsl-ui/ui/ps-select/ps-select.module';
import { PsSelectComponent } from '@pcsl-ui/ui/ps-select/ps-select.component';

@Component({
  selector: 'app-create-admin-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PsCheckboxComponent, PsSvgIconComponent, PsSelectModule],
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
export class CreateAdminModalComponent extends PsModalComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(PsSelectComponent) roleSelect?: PsSelectComponent;

  isEditMode = false;
  private isSubmittingAction = false;
  private destroy$ = new Subject<void>();
  private modalService = inject(PsModalService);
  private readonly cdr = inject(ChangeDetectorRef);
  private initialPrefillDone = false;
  private pendingRoleId: string | null = null;

  // Guards against overlapping/late rAF polling loops (e.g. if the modal
  // is reopened with a different adminId before a previous loop settles).
  private roleWritePollToken = 0;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly injector = inject(Injector);
  readonly adminStore = inject(AdminStore);
  readonly roleStore = inject(RoleStore);
  readonly permissionStore = inject(PermissionStore);

  roles = this.roleStore.roles;
  isLoadingRoles = this.roleStore.isLoading;
  groupedPermissions = this.permissionStore.groupedPermissions;
  isLoadingPermissions = this.permissionStore.isLoadingGrouped;
  isLoadingAdmin = this.adminStore.isLoadingAdmin;
  rolesAndDataReady = signal(false);

  inviteForm: FormGroup = this.fb.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    // IMPORTANT: null, not '' — ps-select's writeValue() treats '' as a
    // real value to resolve against options() (which can crash with
    // NG0950 if options haven't finished binding yet). null takes the
    // cheap resetSelection() path instead.
    roleId: [null as string | null, Validators.required],
    addCustomPermissions: [false],
  });

  get formControls() { return this.inviteForm.controls; }
  get isSubmitting(): boolean { return this.adminStore.isSubmitting(); }

  get groupedEntries(): [string, GroupedPermissionItem[]][] {
    return Object.entries(this.groupedPermissions());
  }

  constructor() {
    super();

    // Effect 1: wait for roles to load, THEN fetch admin in edit mode
    effect(() => {
      const rolesLoaded = this.roles();
      if (rolesLoaded.length === 0) return;

      const adminId = this.data?.['adminId'];
      if (adminId) {
        this.adminStore.fetchAdminById(adminId);
      }
    });

    // Effect 2: prefill form once roles + admin data + permissions are all ready
    effect(() => {
      const grouped = this.groupedPermissions();
      if (Object.keys(grouped).length === 0) return;

      const rolesLoaded = this.roles();
      if (rolesLoaded.length === 0) return;

      const adminId = this.data?.['adminId'];

      if (adminId) {
        const selectedAdmin = this.adminStore.selectedAdmin();
        if (!selectedAdmin) return;

        // IMPORTANT: roleId is deliberately NOT included in this patchValue.
        // patchValue() triggers Angular's ControlValueAccessor.writeValue()
        // on the bound <ps-select> synchronously, in the very same tick —
        // before our own readiness poll ever gets a chance to run. If
        // ps-select's options() haven't fully settled at that instant, its
        // internal applyPendingValue() effect throws NG0950 once options()
        // does populate a moment later. So: patch the plain text fields
        // here (no ps-select involved), and defer roleId until
        // pollAndWriteRoleSelect() has confirmed options() is populated.
        this.inviteForm.patchValue({
          firstname: selectedAdmin.first_name,
          lastname: selectedAdmin.last_name,
          email: selectedAdmin.email,
        });

        this.pendingRoleId = selectedAdmin.role?.id ?? null;

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
        this.rolesAndDataReady.set(true);

        // ps-select's content-children `options()` query needs at least
        // one render pass after `rolesAndDataReady` flips true (which is
        // what mounts <ps-select> in the template) before it has any
        // options to resolve `writeValue()` against. Rather than guessing
        // a fixed setTimeout delay, poll on rAF until options() is
        // actually populated, then write the value.
        this.pollAndWriteRoleSelect(this.pendingRoleId);

      } else {
        this.syncPermissionControls([]);
        this.initialPrefillDone = true;
        this.rolesAndDataReady.set(true);
      }
    });

    // Effect 3: handle submit success/failure
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
      // fetchAdminById is called in Effect 1 after roles load
    }

    this.inviteForm.get('roleId')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedRoleId: string | null) => {
        if (!this.initialPrefillDone) return;
        if (!selectedRoleId) return;

        const selectedRole = this.roles().find((r) => r.id === selectedRoleId);
        const rolePermissions: string[] =
          (selectedRole?.rolePermissions ?? []).map((rp: any) => rp.permission.name);

        this.syncPermissionControls(rolePermissions);
      });
  }

  ngAfterViewInit(): void {
    // If roleSelect is already available and we have a pending value, apply it.
    // (Covers the case where the view was ready before effect 2 ran.)
    if (this.pendingRoleId && this.roleSelect) {
      this.pollAndWriteRoleSelect(this.pendingRoleId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Invalidate any in-flight rAF polling loop.
    this.roleWritePollToken++;
  }

  // ── Role select prefill helper ───────────────────────────────────────────────

  /**
   * Waits (via requestAnimationFrame) until the shared <ps-select>'s public
   * `options()` signal actually has entries, then assigns the role onto the
   * FormControl itself (NOT by calling ps-select.writeValue() directly).
   *
   * Why through the control and not straight at the component: reactive
   * forms' NgControl already owns writeValue() and calls it automatically
   * the instant the control's value changes. If we called
   * `roleSelect.writeValue()` ourselves *and* patched the control, we'd be
   * writing twice from two different places. Routing everything through
   * `setValue()` means there is exactly one path that ever pushes a value
   * into ps-select, and we simply control *when* that path fires — only
   * once options() is confirmed non-empty, which is the actual fix for the
   * NG0950 crash (options not ready yet) and the "only shows after a click"
   * bug (writeValue firing before options existed, silently queued as
   * ps-select's internal pendingValue, and only flushed later by an
   * unrelated change-detection pass from clicking).
   *
   * emitEvent: false is required here — the roleId valueChanges subscriber
   * in ngOnInit() re-syncs permission checkboxes to the *role's* defaults
   * whenever roleId changes. That's correct for a user manually switching
   * roles, but wrong here: we've already synced checkboxes to the admin's
   * actual custom permissions, and letting this emit would silently
   * overwrite them with the role's defaults right after prefill.
   */
  private pollAndWriteRoleSelect(roleId: string | null, attempt = 0): void {
    if (!roleId) return;

    const token = ++this.roleWritePollToken;
    const maxAttempts = 30; // ~30 animation frames safety net (~0.5s worst case)

    const tryWrite = () => {
      // A newer poll (e.g. modal reopened) has superseded this one — bail.
      if (token !== this.roleWritePollToken) return;

      const select = this.roleSelect;

      if (select && select.options().length > 0) {
        this.inviteForm.get('roleId')?.setValue(roleId, { emitEvent: false });
        // Force our own OnPush view to reflect the change without
        // requiring the user to click/interact with anything first.
        this.cdr.markForCheck();
        return;
      }

      if (attempt >= maxAttempts) return;

      requestAnimationFrame(() => this.pollAndWriteRoleSelect(roleId, attempt + 1));
    };

    requestAnimationFrame(tryWrite);
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

    // roleId is guaranteed non-null here: Validators.required blocks
    // submission (and the early return above) while it's null.
    const resolvedRoleId = roleId as string;

    let permissionIds: string[];
    if (addCustomPermissions) {
      permissionIds = this.getSelectedPermissionIds();
    } else {
      const selectedRole = this.roles().find((r) => r.id === resolvedRoleId);
      permissionIds = (selectedRole?.rolePermissions ?? []).map((rp: any) => rp.permission.id);
    }

    const payload: CreateAdminPayload = {
      email,
      first_name: firstname,
      last_name: lastname,
      roleId: resolvedRoleId,
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