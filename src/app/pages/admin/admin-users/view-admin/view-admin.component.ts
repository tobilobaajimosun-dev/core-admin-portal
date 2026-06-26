import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { CreateAdminModalComponent } from '@shared/components/modals/create-admin-modal/create-admin-modal.component';
import { DeleteModalComponent } from '@shared/components/modals/delete-modal/delete-modal.component';
import { AdminStore } from '@core/store/admin.store';
import { signal } from '@angular/core';

interface ActivityLog {
  id: number;
  action: string;
  by?: string;
  timestamp: string;
}

@Component({
  selector: 'app-view-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-admin.component.html',
  styleUrl: './view-admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewAdminComponent implements OnInit {
  private router       = inject(Router);
  private route        = inject(ActivatedRoute);
  private modalService = inject(PsModalService);
  readonly store       = inject(AdminStore);

  readonly admin          = this.store.selectedAdmin;
  readonly isLoadingAdmin = this.store.isLoadingAdmin;
  readonly error          = this.store.error;

  activityLogs = signal<ActivityLog[]>([
    { id: 1, action: 'Logged in',                                  timestamp: '2026-04-24T06:48:00Z' },
    { id: 2, action: 'Approved loan: ₦50,000 – John D.',           timestamp: '2026-04-24T06:48:00Z' },
    { id: 3, action: 'Role updated: Operations', by: 'Super Admin', timestamp: '2026-04-24T06:48:00Z' },
    { id: 4, action: 'Admin logged in',                            timestamp: '2026-04-24T06:48:00Z' },
    { id: 5, action: 'Admin logged out',                           timestamp: '2026-04-24T06:48:00Z' },
  ]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.fetchAdminById(id);
    }
  }

  getInitials(): string {
    const a = this.admin();
    if (!a) return '';
    return `${a.first_name.charAt(0)}${a.last_name.charAt(0)}`.toUpperCase();
  }

  goBack(): void {
    this.router.navigate(['/admin-users']);
  }

 openEditModal(): void {
  const admin = this.admin();
  if (!admin) return;
  this.store.selectAdmin(admin);                   
  this.modalService.open(CreateAdminModalComponent, {
    maxWidth: '560px',
    isCentered: true,
    data: { adminId: admin.id },               
  });
}

  confirmDelete(): void {
  const a = this.admin();
  if (!a) return;
  this.modalService.open(DeleteModalComponent, {
    maxWidth: '520px',
    isCentered: true,
    data: {
      title:             'Delete admin?',
      description:       "This action cannot be undone. Type the admin's email address to confirm.",
      fieldLabel:        "Admin's email address",
      fieldPlaceholder:  "Enter admin's email",
      confirmationValue: a.email,
      deleteButtonLabel: 'Delete admin',
      onConfirm: () => {
        this.store.deleteAdmin(a.id);
        this.router.navigate(['/admin-users']);
      },
    },
  });
}
}