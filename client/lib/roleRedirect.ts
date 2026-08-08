import { Role } from '@/types/auth';

export type DashboardRoute = '/dashboard/citizen' | '/dashboard/worker' | '/dashboard/admin';

export function getRoleRedirectPath(role: Role): DashboardRoute {
  switch (role) {
    case 'CITIZEN':
      return '/dashboard/citizen';
    case 'WORKER':
      return '/dashboard/worker';
    case 'ADMIN':
      return '/dashboard/admin';
    default:
      const exhaustiveCheck: never = role;
      return '/dashboard/citizen';
  }
}