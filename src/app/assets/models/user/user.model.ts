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
