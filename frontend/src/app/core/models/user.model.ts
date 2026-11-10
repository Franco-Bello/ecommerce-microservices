export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  password?: string;
}