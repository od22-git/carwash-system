import type { Role } from '@carwash/shared';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSessionUser } from './use-session';

/** Sends logged-out visitors to the login screen. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useSessionUser();
  const location = useLocation();
  if (user === undefined) return null;
  if (user === null) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

/** Hides admin screens from the cashier, even if the address is typed by hand. */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const user = useSessionUser();
  if (!user) return null;
  return user.role === role ? children : <Navigate to="/wash" replace />;
}
