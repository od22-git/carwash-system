import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useSessionUser } from '../../core/auth';
import { startSync } from '../../core/sync';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';

/**
 * Frame for every screen after login. Sync runs while it is open.
 * On a laptop the menu is a side bar; on a phone it is a scrolling strip on top.
 */
export function AppShell() {
  const user = useSessionUser();
  useEffect(() => startSync(), []);
  if (!user) return null;

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <SideNav role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar user={user} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
