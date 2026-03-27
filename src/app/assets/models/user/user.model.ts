export interface User {
  id: number;
  username: string;
  email: string;
  phone: number;
  birth_date: Date;
  role: 'admin' | 'client';
  created_at: Date;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  phone?: number;
  birth_date?: Date | string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  phone: number;
  birth_date: Date | string;
  role?: 'admin' | 'client';
}

export interface UpdateRoleRequest {
  role: 'admin' | 'client';
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  phone: number;
  birth_date: Date;
  role: string;
  created_at: Date;
}
