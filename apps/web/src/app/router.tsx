import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { RequireAuth, RequireRole } from '../core/auth';
import { LoginPage, SetupPage } from '../features/auth';
import { SettingsPage } from '../features/settings';
import { AppShell } from './layout/AppShell';
import { isAdminOnly, NAV_ITEMS, type NavItem } from './navigation';
import { PlaceholderPage } from './PlaceholderPage';

/** Screens that are built. The rest show a placeholder until their milestone. */
const PAGES: Record<string, ReactNode> = {
  '/settings': <SettingsPage />,
};

function screenFor(item: NavItem): ReactNode {
  const page = PAGES[item.path] ?? <PlaceholderPage title={item.label} />;
  return isAdminOnly(item) ? <RequireRole role="admin">{page}</RequireRole> : page;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/setup', element: <SetupPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/wash" replace /> },
      ...NAV_ITEMS.map((item) => ({ path: item.path, element: screenFor(item) })),
      { path: '*', element: <Navigate to="/wash" replace /> },
    ],
  },
]);
