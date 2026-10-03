import type { INestApplication } from '@nestjs/common';
import { ApiClient } from '../../test-utils/api-client';
import { createTestApp } from '../../test-utils/create-test-app';
import { resetDatabase } from '../../test-utils/reset-database';

describe('auth', () => {
  let app: INestApplication;
  let api: ApiClient;

  beforeAll(async () => {
    await resetDatabase();
    app = await createTestApp();
    api = new ApiClient(app);
  });

  afterAll(() => app.close());

  it('asks for setup on a fresh install, then creates the admin', async () => {
    const before = await api.http.get('/api/auth/setup-status').expect(200);
    expect(before.body.needsSetup).toBe(true);

    const { user, token } = await api.setupAdmin();
    expect(user.role).toBe('admin');
    expect(token).toBeTruthy();

    const after = await api.http.get('/api/auth/setup-status').expect(200);
    expect(after.body.needsSetup).toBe(false);
  });

  it('refuses a second setup', async () => {
    const body = { name: 'غريب', username: 'intruder', password: 'secret123' };
    await api.http.post('/api/auth/setup').send(body).expect(403);
  });

  it('logs in with the right password only', async () => {
    await api.http
      .post('/api/auth/login')
      .send({ username: 'owner', password: 'wrong' })
      .expect(401);
    const res = await api.http
      .post('/api/auth/login')
      .send({ username: 'OWNER', password: 'secret123' })
      .expect(200);
    expect(res.body.user.username).toBe('owner');
  });

  it('protects routes without a token', async () => {
    await api.http.get('/api/auth/me').expect(401);
  });

  it('lets only the admin manage users', async () => {
    const admin = await api.http
      .post('/api/auth/login')
      .send({ username: 'owner', password: 'secret123' });
    const cashier = await api.createUser(admin.body.token, 'cashier', 'user');
    await api.http.get('/api/users').set('Authorization', `Bearer ${cashier.token}`).expect(403);
  });

  it('blocks a disabled account immediately', async () => {
    const admin = await api.http
      .post('/api/auth/login')
      .send({ username: 'owner', password: 'secret123' });
    const temp = await api.createUser(admin.body.token, 'temp', 'user');
    await api.http
      .patch(`/api/users/${temp.user.id}`)
      .set('Authorization', `Bearer ${admin.body.token}`)
      .send({ active: false })
      .expect(200);
    await api.http.get('/api/auth/me').set('Authorization', `Bearer ${temp.token}`).expect(401);
  });
});
