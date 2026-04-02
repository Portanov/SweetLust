export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone: number;
  birth_date: string;
  role: UserRole;
  created_at?: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  phone?: number;
  birth_date?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  phone: number;
  birth_date: string;
  role?: UserRole;
}

export interface UpdateRoleRequest {
  role: UserRole;
}
