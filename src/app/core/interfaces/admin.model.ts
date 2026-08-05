export interface AdminRole {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  rolePermissions: {
    id: string;
    roleId: string;
    permissionId: string;
    permission: {
      id: string;
      name: string;
      description: string | null;
      created_at: string;
    };
  }[];
}

export interface Admin {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image: string | null;
  changePassword: number;
  login_attempts: number;
  is_locked: boolean;
  is_active: boolean;
  roleId: string;
  role: AdminRole;
  adminPermissions: AdminPermissionRecord[]; 
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateAdminPayload {
  email: string;
  first_name: string;
  last_name: string;
  roleId: string;
  permissionIds: string[];
}

export interface UpdateAdminPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  profile_image?: string | null;
  roleId?: string;
  permissionIds?: string[];
}

export interface AdminResponse {
  statusCode: number;
  status: string;
  message: string;
  data: Admin;
  responseCode: string;
}

export interface AdminListResponse {
  statusCode: number;
  status: string;
  message: string;
  data: {
    items: Admin[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  responseCode: string;
}

export interface AdminPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  date_created_filter?: string;  
  start_date?: string;   
  end_date?: string; 
}

export interface AdminPermissionRecord {
  id: string;           
  adminId: string;
  permissionId: string;
  permission: {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
  };
}

 