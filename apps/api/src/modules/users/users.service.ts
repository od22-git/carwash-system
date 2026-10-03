import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateUserRequest, SessionUser, UpdateUserRequest } from '@carwash/shared';
import { hashPassword, verifyPassword } from './password';
import { UsersRepository } from './users.repository';
import type { UserRow } from './users.schema';

const toSessionUser = (u: UserRow): SessionUser => ({
  id: u.id,
  name: u.name,
  username: u.username,
  role: u.role,
});

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  hasAnyUser = async () => (await this.repo.count()) > 0;

  async list() {
    const rows = await this.repo.list();
    return rows.map((u) => ({ ...toSessionUser(u), active: u.active }));
  }

  async create(input: CreateUserRequest): Promise<SessionUser> {
    const username = input.username.toLowerCase();
    if (await this.repo.findByUsername(username)) {
      throw new ConflictException('Username is already taken');
    }
    const passwordHash = await hashPassword(input.password);
    const row = await this.repo.insert({ ...input, username, passwordHash });
    return toSessionUser(row);
  }

  async update(id: string, input: UpdateUserRequest): Promise<SessionUser> {
    const { password, ...rest } = input;
    const changes = password ? { ...rest, passwordHash: await hashPassword(password) } : rest;
    const row = await this.repo.update(id, changes);
    if (!row) throw new NotFoundException('User not found');
    return toSessionUser(row);
  }

  /** Returns the user only when the password is right and the account is active. */
  async verifyCredentials(username: string, password: string): Promise<SessionUser | null> {
    const row = await this.repo.findByUsername(username.toLowerCase());
    if (!row?.active || !(await verifyPassword(password, row.passwordHash))) return null;
    return toSessionUser(row);
  }

  async findActive(id: string): Promise<SessionUser | null> {
    const row = await this.repo.findById(id);
    return row?.active ? toSessionUser(row) : null;
  }
}
