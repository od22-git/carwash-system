import type { LoginResponse, SessionUser, SetupRequest } from '@carwash/shared';
import { api, OfflineError } from '../api';
import { deleteMeta, getMeta, setMeta } from '../db';
import { ensureDeviceRegistered } from '../device';
import { createCredential, verifyCredential } from './offline-credential';

/** Thrown when offline and this laptop has no matching earlier login. */
export class OfflineLoginError extends Error {}

async function startSession(response: LoginResponse, password: string): Promise<SessionUser> {
  const saved = (await getMeta('credentials')) ?? {};
  saved[response.user.username] = {
    credential: await createCredential(password),
    session: response,
  };
  await setMeta('credentials', saved);
  await setMeta('session', response);
  await ensureDeviceRegistered(response.user.role);
  return response.user;
}

async function loginOffline(username: string, password: string): Promise<SessionUser> {
  const saved = (await getMeta('credentials'))?.[username.toLowerCase()];
  if (!saved || !(await verifyCredential(saved.credential, password)))
    throw new OfflineLoginError();
  await setMeta('session', saved.session);
  return saved.session.user;
}

/** Online when possible; falls back to this laptop's earlier login when there is no internet. */
export async function login(username: string, password: string): Promise<SessionUser> {
  try {
    const response = await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { username, password },
      auth: false,
    });
    return startSession(response, password);
  } catch (error) {
    if (error instanceof OfflineError) return loginOffline(username, password);
    throw error;
  }
}

export async function setupAdmin(input: SetupRequest): Promise<SessionUser> {
  const response = await api<LoginResponse>('/auth/setup', {
    method: 'POST',
    body: input,
    auth: false,
  });
  return startSession(response, input.password);
}

export async function needsSetup(): Promise<boolean> {
  const { needsSetup } = await api<{ needsSetup: boolean }>('/auth/setup-status', { auth: false });
  return needsSetup;
}

/** Ends the session. Data and unsent changes stay on the laptop for the next login. */
export const logout = () => deleteMeta('session');
