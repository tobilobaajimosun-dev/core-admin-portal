export interface AdminRole {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoggedInUser {
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
  role: AdminRole;
  permissions: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LoginResponse {
  statusCode: number;
  status: string;
  message: string;
  responseCode: string;
  data: LoginResponseData;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: LoggedInUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface verifyOtpResponse {
  user: LoggedInUser;
  message: string;
  accessToken: string;
  status: string;
  data: {
    action: string;
    accessToken: string;
  };
}

/** The three modal steps - password reset */
export type ResetPasswordStep = 'email' | 'otp' | 'new-password';

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
}

export interface ResetPasswordResponse {
  statusCode: number;
  status: string;
  message: string;
  data: { otp: string } | null;
  responseCode: string;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponse {
  statusCode: number;
  status: string;
  message: string;
  data: boolean;
  responseCode: string;
}