import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { PsEmptyComponent } from '@pcsl-ui/ui/ps-empty/ps-empty.component';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsDropdownModule } from '@pcsl-ui/ui/ps-dropdown/ps-dropdown.module';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { CreateRoleModalComponent } from '@shared/components/modals/create-role-modal/create-role-modal.component';
import { DeleteModalComponent } from '@shared/components/modals/delete-modal/delete-modal.component';
import { RoleStore } from '@core/store/role.store';
import { Role, RoleListConfig } from '@core/interfaces/role.model';
import { DropdownComponent } from "@shared/components/dropdown/dropdown.component";
import { PsRadioComponent } from '@pcsl-ui/ui/ps-radio/ps-radio.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PsPaginationComponent,
    PsEmptyComponent,
    PsSvgIconComponent,
    PsDropdownModule,
    PsRadioComponent,
    DropdownComponent,
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesComponent implements OnInit {
  private router = inject(Router);

  readonly roleStore = inject(RoleStore);
  private readonly modalService = inject(PsModalService);

  $listConfig = this.roleStore.listConfig;

  skeletonRows = new Array(5);
  columns = ['Role title', 'Permission', 'Date Created', ''];

  dateFilter = '';
  showCustomDateFilter = signal(false);
  customDateFilterForm = inject(NonNullableFormBuilder).group({
    start_date: [''],
    end_date: [''],
  });

  readonly dateFilterLabels: Record<string, string> = {
    past_7_days:  'Past 7 days',
    past_14_days: 'Past 14 days',
    past_30_days: 'Past 30 days',
    custom_range: 'Custom range',
  };

  ngOnInit(): void {
    this.roleStore.fetchAllRoles(this.$listConfig());
  }

  search(text: string): void {
    this.roleStore.searchRoles({ ...this.$listConfig(), page: 1, search: text });
  }

  toggleCustomDateFilter(value: string): void {
    this.showCustomDateFilter.set(value === 'custom_range');
    if (value !== 'custom_range') this.customDateFilterForm.reset();
  }

  applyFilter(filterDropdown: DropdownComponent): void {
    filterDropdown.close();

    const params: RoleListConfig = { ...this.$listConfig(), page: 1 };

    if (this.dateFilter === 'custom_range') {
      const { start_date, end_date } = this.customDateFilterForm.getRawValue();
      params.start_date = start_date;
      params.end_date = end_date;
    } else {
      params.date_created_filter = this.dateFilter;
    }

    this.roleStore.fetchAllRoles(params);
  }

  clearFilter(): void {
    this.dateFilter = '';
    this.showCustomDateFilter.set(false);
    this.customDateFilterForm.reset();

    const params: RoleListConfig = { ...this.$listConfig(), page: 1 };
    delete params.date_created_filter;
    delete params.start_date;
    delete params.end_date;

    this.roleStore.fetchAllRoles(params);
  }

   onPageSizeChange(size: number): void {
    this.roleStore.fetchAllRoles({ ...this.$listConfig(), page: 1, limit: size });
  }

  openCreateRoleModal(): void {
    this.modalService.open(CreateRoleModalComponent, {
      maxWidth: '560px',
      isCentered: true,
    });
  }

  openViewRoleModal(role: Role): void {
    this.modalService.open(CreateRoleModalComponent, {
      maxWidth: '560px',
      isCentered: true,
      data: { viewMode: true, roleId: role.id },
    });
  }

  openEditRoleModal(role: Role): void {
    this.modalService.open(CreateRoleModalComponent, {
      maxWidth: '560px',
      isCentered: true,
      data: { viewMode: false, roleId: role.id },
    });
  }

  openDeleteRoleModal(role: Role): void {
    this.modalService.open(DeleteModalComponent, {
      maxWidth: '520px',
      isCentered: true,
      data: {
        title: 'Delete role?',
        description: 'This action cannot be undone. Type the role name to confirm.',
        fieldLabel: 'Role name',
        fieldPlaceholder: 'Enter role name',
        confirmationValue: role.name,
        deleteButtonLabel: 'Delete role',
        onConfirm: () => this.roleStore.deleteRole(role.id),
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin-users']);
  }
}