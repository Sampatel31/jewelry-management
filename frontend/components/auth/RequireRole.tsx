'use client';
import { getUser } from '@/lib/auth';

interface RequireRoleProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renders children only if the current user's role is in the allowed roles list.
 * Shows nothing (or an optional fallback) otherwise.
 */
export default function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
  const user = getUser();
  if (!user || !roles.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
