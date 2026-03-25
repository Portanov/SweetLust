// src/assets/models/auth/auth.model.ts
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'client';
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone: number;
  birth_date: string;
}

export interface RegisterResponse {
  message: string;
}

export interface LoginFirstStepRequest {
  email: string;
  password: string;
}

export interface LoginFirstStepResponse {
  temp_token: string;
  message: string;
  requires_2fa: boolean;
}

export interface VerifyPinRequest {
  email: string;
  pin: string;
  temp_token: string;
}

export interface VerifyPinResponse {
  access_token: string;
  user: User;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  username: string;
  exp: number;
  iat: number;
}
