import type { CreateUserRequest, SessionUser } from '@carwash/shared';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../../core/api';

export type ListedUser = SessionUser & { active: boolean };

/** Accounts live on the server only, so this screen needs internet. */
export function useUsers() {
  const [users, setUsers] = useState<ListedUser[] | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    try {
      setUsers(await api<ListedUser[]>('/users'));
      setLoadError(null);
    } catch (error) {
      setLoadError(error);
    }
  }, []);

  useEffect(() => void refresh(), [refresh]);

  const create = async (input: CreateUserRequest) => {
    await api('/users', { method: 'POST', body: input });
    await refresh();
  };

  const setActive = async (id: string, active: boolean) => {
    await api(`/users/${id}`, { method: 'PATCH', body: { active } });
    await refresh();
  };

  return { users, loadError, refresh, create, setActive };
}
