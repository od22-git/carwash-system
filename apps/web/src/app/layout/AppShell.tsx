import type { Role } from '@carwash/shared';
import { Outlet } from 'react-router';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';

// Replaced by the logged-in user in milestone 1 (auth).
const DEV_USER = { name: 'حساب تجريبي', role: 'admin' as Role };

export function AppShell() {
  return (
    <div className="flex min-h-dvh">
      <SideNav role={DEV_USER.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar userName={DEV_USER.name} role={DEV_USER.role} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
