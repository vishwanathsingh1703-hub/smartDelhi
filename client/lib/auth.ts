import { cookies } from 'next/headers';

import { verifyToken } from './jwt';
import { prisma } from './prisma';

import { UserSafeProfile } from '@/types/auth';

export async function getSessionUser(): Promise<UserSafeProfile | null> {
  try {
    // Get cookies
    const cookieStore = await cookies();

    // Get authentication token
    const token = cookieStore.get('token')?.value;

    // No token = not authenticated
    if (!token) {
      return null;
    }

    // Verify JWT
    const payload = verifyToken(token);

    // Invalid / expired token
    if (!payload || !payload.userId) {
      return null;
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    // User doesn't exist or account is disabled
    if (!user || !user.isActive) {
      return null;
    }

    // Return safe user object
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ward: user.ward,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('getSessionUser error:', error);

    return null;
  }
}