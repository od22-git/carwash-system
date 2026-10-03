import { DEVICE_HEADER } from '@carwash/shared';
import { getMeta } from '../db/meta';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

/** The server answered with an error (wrong password, not allowed, ...). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** The server could not be reached (no internet, server down). */
export class OfflineError extends Error {
  constructor() {
    super('Server not reachable');
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  /** Send the saved login token and device id. Default true. */
  auth?: boolean;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const [session, device] = await Promise.all([getMeta('session'), getMeta('device')]);
    if (session) headers.Authorization = `Bearer ${session.token}`;
    if (device) headers[DEVICE_HEADER] = device.id;
  }

  let response: Response;
  try {
    response = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new OfflineError();
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(response.status, data.message ?? response.statusText);
  }
  return response.json() as Promise<T>;
}
