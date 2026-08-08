import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_smartdelhi_super_secret_jwt_key_2026';

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}