export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  status: AdminUserStatus;
  createdAt: string;
}

export interface CreateAdminUserPayload {
  email: string;
  password: string;
  role: string;
  first_name?: string;
  last_name?: string;
  permissions?: string[];
  status?: AdminUserStatus;
}

export interface UpdateAdminUserPayload {
  first_name?: string;
  last_name?: string;
  role?: string;
  permissions?: string[];
  status?: AdminUserStatus;
  password?: string;
}
