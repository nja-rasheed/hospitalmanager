'use client';

import React from 'react';
import { useUser } from '../hooks/useUser';

interface RoleGuardProps {
  allowed: Array<'admin' | 'staff' | 'patient'>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowed, children, fallback = null }: RoleGuardProps) {
  const { role } = useUser();

  if (!role || !allowed.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default RoleGuard;
