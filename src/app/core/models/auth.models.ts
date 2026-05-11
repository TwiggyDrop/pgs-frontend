export type Role = 'ADMIN' | 'STUDENT' | 'COMPANY' | 'SUPERVISOR';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'COMPANY' | 'SUPERVISOR';
  studentNumber?: string;
  university?: string;
  specialization?: string;
  companyName?: string;
  industry?: string;
  website?: string;
  department?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string | null;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
}
