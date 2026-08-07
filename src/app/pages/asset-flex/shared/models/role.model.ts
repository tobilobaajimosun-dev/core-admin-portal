export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRolePayload {
  name: string;
  permissions: string[];
  description?: string;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissions?: string[];
}
