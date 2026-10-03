import { ROLE_LABELS } from '@carwash/shared';
import { errorMessage } from '../../../shared/lib/error-message';
import { Button, Notice, Panel } from '../../../shared/ui';
import { useUsers } from '../hooks/use-users';
import { CreateUserForm } from './CreateUserForm';

export function UsersPanel({ currentUserId }: { currentUserId: string }) {
  const { users, loadError, refresh, create, setActive } = useUsers();

  return (
    <Panel
      title="الحسابات"
      description="حساب الموظف يسجّل الغسيل والبيع فقط. إدارة الحسابات تحتاج اتصالاً بالإنترنت."
    >
      {loadError ? (
        <div className="flex flex-col items-start gap-3">
          <Notice tone="error">{errorMessage(loadError)}</Notice>
          <Button variant="secondary" onClick={() => void refresh()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <ul className="divide-y divide-line rounded-lg border border-line">
            {(users ?? []).map((user) => (
              <li
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <span>
                  <span className="font-semibold">{user.name}</span>
                  <span className="text-muted" dir="ltr">
                    {' '}
                    {user.username}{' '}
                  </span>
                  <span className="text-sm text-muted">
                    ({ROLE_LABELS[user.role]}
                    {user.active ? '' : '، موقوف'})
                  </span>
                </span>
                {user.id !== currentUserId && (
                  <Button variant="quiet" onClick={() => void setActive(user.id, !user.active)}>
                    {user.active ? 'إيقاف الحساب' : 'تفعيل الحساب'}
                  </Button>
                )}
              </li>
            ))}
          </ul>
          <div>
            <h3 className="mb-4 font-semibold">حساب جديد</h3>
            <CreateUserForm onCreate={create} />
          </div>
        </div>
      )}
    </Panel>
  );
}
