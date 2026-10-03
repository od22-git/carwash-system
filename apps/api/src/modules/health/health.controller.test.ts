import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../../test-utils/create-test-app';

describe('GET /api/health', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('answers ok when the database is reachable', async () => {
    const res = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(res.body.status).toBe('ok');
  });
});
