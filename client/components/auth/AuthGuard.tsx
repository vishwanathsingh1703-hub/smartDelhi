'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserSafeProfile, Role } from '@/types/auth';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

export default function AuthGuard({
  children,
  allowedRoles,
}: AuthGuardProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserSafeProfile | null>(null);

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          if (mounted) {
            router.replace('/auth');
          }
          return;
        }

        const data = await response.json();
        const sessionUser = data?.user as UserSafeProfile | undefined;

        if (!sessionUser) {
          if (mounted) {
            router.replace('/auth');
          }
          return;
        }

        // Role-based authorization
        if (
          allowedRoles &&
          allowedRoles.length > 0 &&
          !allowedRoles.includes(sessionUser.role)
        ) {
          if (mounted) {
            router.replace('/dashboard');
          }
          return;
        }

        if (mounted) {
          setUser(sessionUser);
        }
      } catch (error) {
        console.error('AuthGuard session verification failed:', error);

        if (mounted) {
          router.replace('/auth');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      mounted = false;
    };
  }, [router, allowedRoles]);

  // Secure loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />

          <div className="text-center">
            <p className="text-sm font-semibold text-white">
              SmartDELHI
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Verifying secure session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Prevent protected content from flashing before redirect
  if (!user) {
    return null;
  }

  return <>{children}</>;
}