import { ROLE_LABELS, type Role } from '@carwash/shared';
import { ConnectionStatus } from './ConnectionStatus';

interface TopBarProps {
  userName: string;
  role: Role;
}

export function TopBar({ userName, role }: TopBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-line bg-surface px-6 py-3">
      <ConnectionStatus />
      <p className="text-sm">
        <span className="font-semibold">{userName}</span>
        <span className="text-muted"> ({ROLE_LABELS[role]})</span>
      </p>
    </div>
  );
}
