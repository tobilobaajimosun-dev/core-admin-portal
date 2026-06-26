import { ChangeDetectionStrategy, Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { PsEmptyComponent } from '@pcsl-ui/ui/ps-empty/ps-empty.component';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsRadioComponent } from '@pcsl-ui/ui/ps-radio/ps-radio.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { CreateAdminModalComponent } from '@shared/components/modals/create-admin-modal/create-admin-modal.component';
import { DeleteModalComponent } from '@shared/components/modals/delete-modal/delete-modal.component';
import { AdminStore } from '@core/store/admin.store';
import { Admin, AdminListParams } from '@core/interfaces/admin.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PsPaginationComponent,
    PsEmptyComponent,
    PsSvgIconComponent,
    PsRadioComponent,
    DropdownComponent,
    
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent implements OnInit {

  private modalService = inject(PsModalService);
  private router = inject(Router);
  readonly store = inject(AdminStore);
  
  $listConfig = this.store.listConfig;

  skeletonRows = new Array(5);
  columns = ['Name', 'Role', 'Status', 'Last log in', ''];

  isLoading = this.store.isLoading;
  adminUsers = this.store.admins;
  currentPage = signal(1);

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
    this.store.fetchAllAdmins(this.$listConfig());
  }

  gotoRoles(): void {
    this.router.navigate(['/admin-users/roles']);
  }

  viewAdmin(user: Admin): void {
    this.router.navigate(['/admin-users', user.id]);
  }

openInviteModal(): void {
    this.modalService.open(CreateAdminModalComponent, {
      maxWidth: '560px',
      isCentered: true,
    });
  }

openEditAdminModal(user: Admin): void {
  this.store.selectAdmin(user);
  this.modalService.open(CreateAdminModalComponent, {
    maxWidth: '560px',
    isCentered: true,
    data: {
     adminId: user.id,
    },
  });
}

openDeleteAdminModal(user: Admin): void {
    this.modalService.open(DeleteModalComponent, {
      maxWidth: '520px',
      isCentered: true,
      data: {
        title: 'Delete admin?',
        description: "This action cannot be undone. Type the admin's email address to confirm.",
        fieldLabel: "Admin's email address",
        fieldPlaceholder: "Enter admin's email",
        confirmationValue: user.email,
        deleteButtonLabel: 'Delete admin',
        onConfirm: () => {
          this.store.deleteAdmin(user.id);
        },
      },
    });
  }

  onSearch(value: string): void {
    this.store.searchAdmins({
      ...this.store.listConfig(),
      page: 1,
      search: value,
    });
  }

  clearFilter(): void {
  this.dateFilter = '';
  this.showCustomDateFilter.set(false);
  this.customDateFilterForm.reset();
  
  const params: AdminListParams = { ...this.store.listConfig(), page: 1 };
  delete params.date_created_filter;
  delete params.start_date;
  delete params.end_date;

  this.store.fetchAllAdmins(params);
}

  toggleCustomDateFilter(value: string): void {
    this.showCustomDateFilter.set(value === 'custom_range');
    if (value !== 'custom_range') this.customDateFilterForm.reset();
  }

applyFilter(filterDropdown: DropdownComponent): void {
  filterDropdown.close();

  const params: AdminListParams = {
    ...this.store.listConfig(),
    page: 1,
  };

  if (this.dateFilter === 'custom_range') {
    const { start_date, end_date } = this.customDateFilterForm.getRawValue();
    params.start_date = start_date;
    params.end_date = end_date;
  } else {
    params.date_created_filter = this.dateFilter; 
  }

  this.store.fetchAllAdmins(params);
}

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.store.fetchAllAdmins({ ...this.store.listConfig(), page });
  }

  onPageSizeChange(size: number): void {
    this.store.fetchAllAdmins({ ...this.store.listConfig(), page: 1, limit: size });
  }
}