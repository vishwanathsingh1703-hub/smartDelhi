export type Role = 'CITIZEN' | 'WORKER' | 'ADMIN';

export interface UserSafeProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  ward?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}