import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useSessionUser } from '../../core/auth';
import { startSync } from '../../core/sync';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';

/** Frame for every screen after login. Sync runs while it is open. */
export function AppShell() {
  const user = useSessionUser();
  useEffect(() => startSync(), []);
  if (!user) return null;

  return (
    <div className="flex min-h-dvh">
      <SideNav role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar user={user} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
