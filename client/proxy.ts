import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

type Role = 'CITIZEN' | 'WORKER' | 'ADMIN';

function getRoleDashboardPath(role: Role) {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin';

    case 'WORKER':
      return '/dashboard/worker';

    case 'CITIZEN':
    default:
      return '/dashboard/citizen';
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Token cookie read karo
  const token = request.cookies.get('token')?.value;

  // Token verify karo
  const payload = token ? verifyToken(token) : null;

  const isAuthenticated = Boolean(payload);

  // ================================
  // AUTH PAGE
  // ================================
  if (pathname === '/auth') {
    // Already logged in hai → dashboard
    if (isAuthenticated && payload?.role) {
      const role = payload.role as Role;

      return NextResponse.redirect(
        new URL(getRoleDashboardPath(role), request.url)
      );
    }

    return NextResponse.next();
  }

  // ================================
  // DASHBOARD PROTECTION
  // ================================
  if (pathname.startsWith('/dashboard')) {
    // Login nahi hai
    if (!isAuthenticated || !payload) {
      return NextResponse.redirect(
        new URL('/auth', request.url)
      );
    }

    const role = payload.role as Role;

    // ================================
    // ADMIN
    // ================================
    if (
      pathname.startsWith('/dashboard/admin') &&
      role !== 'ADMIN'
    ) {
      return NextResponse.redirect(
        new URL(getRoleDashboardPath(role), request.url)
      );
    }

    // ================================
    // WORKER
    // ================================
    if (
      pathname.startsWith('/dashboard/worker') &&
      role !== 'WORKER'
    ) {
      return NextResponse.redirect(
        new URL(getRoleDashboardPath(role), request.url)
      );
    }

    // ================================
    // CITIZEN
    // ================================
    if (
      pathname.startsWith('/dashboard/citizen') &&
      role !== 'CITIZEN'
    ) {
      return NextResponse.redirect(
        new URL(getRoleDashboardPath(role), request.url)
      );
    }
  }

  // ================================
  // PROTECTED API
  // ================================
  if (pathname.startsWith('/api/protected')) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth',
    '/dashboard/:path*',
    '/api/protected/:path*',
  ],
};