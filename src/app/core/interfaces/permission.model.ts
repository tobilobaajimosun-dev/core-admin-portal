export interface Permission {
  id: string;
  name: string;
  description: string;
  created_at: string;
  rolePermissions: RolePermission[];
}

export interface RolePermission {
  id: string;
}

export interface CreatePermissionPayload {
  name: string;
  description: string;
}

export interface PermissionListConfig {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PermissionResponse {
  statusCode: number;
  status: string;
  message: string;
  responseCode: string;
  data: Permission;
}

export interface PermissionListResponse {
  statusCode: number;
  status: string;
  message: string;
  responseCode: string;
  data: Permission[]; 
}

export interface GroupedPermissionItem {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export type GroupedPermissions = Record<string, GroupedPermissionItem[]>;

export interface GroupedPermissionResponse {
  statusCode: number;
  status: string;
  message: string;
  responseCode: string;
  data: GroupedPermissions;
}