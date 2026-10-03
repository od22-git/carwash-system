import { ROLE_LABELS, type SessionUser } from '@carwash/shared';
import { useNavigate } from 'react-router';
import { logout } from '../../core/auth';
import { Button } from '../../shared/ui';
import { ConnectionStatus } from './ConnectionStatus';

export function TopBar({ user }: { user: SessionUser }) {
  const navigate = useNavigate();

  async function signOut() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 md:px-6">
      <ConnectionStatus />
      <div className="flex items-center gap-4 text-sm">
        <p>
          <span className="font-semibold">{user.name}</span>
          <span className="text-muted"> ({ROLE_LABELS[user.role]})</span>
        </p>
        <Button variant="quiet" onClick={() => void signOut()}>
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
}
