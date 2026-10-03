import type { INestApplication } from '@nestjs/common';
import { DEVICE_HEADER, type DeviceInfo, type LoginResponse, type Role } from '@carwash/shared';
import request from 'supertest';

/** Small helpers so tests read like the real flow: set up, log in, register the laptop. */
export class ApiClient {
  constructor(private readonly app: INestApplication) {}

  get http() {
    return request(this.app.getHttpServer());
  }

  async setupAdmin(): Promise<LoginResponse> {
    const body = { name: 'صاحب المغسلة', username: 'owner', password: 'secret123' };
    const res = await this.http.post('/api/auth/setup').send(body).expect(201);
    return res.body;
  }

  async createUser(adminToken: string, username: string, role: Role): Promise<LoginResponse> {
    const password = 'secret123';
    await this.http
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: username, username, password, role })
      .expect(201);
    const res = await this.http.post('/api/auth/login').send({ username, password }).expect(200);
    return res.body;
  }

  async registerDevice(token: string, name = 'لابتوب الاستقبال'): Promise<DeviceInfo> {
    const res = await this.http
      .post('/api/devices')
      .set('Authorization', `Bearer ${token}`)
      .send({ name })
      .expect(201);
    return res.body;
  }

  /** Authorized request from a registered laptop. */
  as(token: string, deviceId: string) {
    const auth = (r: request.Test) =>
      r.set('Authorization', `Bearer ${token}`).set(DEVICE_HEADER, deviceId);
    return {
      push: (ops: unknown[]) => auth(this.http.post('/api/sync/push')).send({ ops }),
      pull: (since = 0) => auth(this.http.get(`/api/sync/pull?since=${since}`)),
    };
  }
}
