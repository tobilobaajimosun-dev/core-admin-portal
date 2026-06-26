export interface Permission {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface RolePermission {
 id: string;
  roleId: string;
  permissionId: string;
  permission: Permission;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  rolePermissions?: RolePermission[];
}

export interface CreateRolePayload {
  name: string;
  description: string;
  permissionIds?: string[];

}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissionIds?: string[];

}

export interface RolePagination {
  total: number;
  currentPage: number;
  perPage: number;
  totalPages: number;
}

export interface RoleListConfig {
  page: number;
  limit: number;
  search?: string;
  date_created_filter?: string;
  start_date?: string;
  end_date?: string;
}

export interface RoleResponse {
  statusCode: number;
  status: string;
  message: string;
  responseCode: string;
  data: Role;
}

export interface RoleListResponse {
  statusCode: number;
  status: string;
  message: string;
  responseCode: string;
  data: {
    items: Role[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface DeleteRoleResponse {
  statusCode: number;
  status: string;
  message: string;
  data: null;
  responseCode: string;
}