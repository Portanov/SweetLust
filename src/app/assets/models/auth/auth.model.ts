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
  message: string;
  requires_2fa: boolean;
}

export interface VerifyPinRequest {
  email: string;
  pin: string;
}

export interface VerifyPinResponse {
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
