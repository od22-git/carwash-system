import { Inject, Injectable } from '@nestjs/common';
import { asc, count, eq } from 'drizzle-orm';
import { DB, type Database } from '../../database';
import { users, type NewUserRow, type UserRow } from './users.schema';

@Injectable()
export class UsersRepository {
  constructor(@Inject(DB) private readonly db: Database) {}

  async count(): Promise<number> {
    const [row] = await this.db.select({ n: count() }).from(users);
    return row?.n ?? 0;
  }

  async findById(id: string): Promise<UserRow | undefined> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id));
    return row;
  }

  async findByUsername(username: string): Promise<UserRow | undefined> {
    const [row] = await this.db.select().from(users).where(eq(users.username, username));
    return row;
  }

  list(): Promise<UserRow[]> {
    return this.db.select().from(users).orderBy(asc(users.createdAt));
  }

  async insert(values: NewUserRow): Promise<UserRow> {
    const [row] = await this.db.insert(users).values(values).returning();
    return row!;
  }

  async update(id: string, values: Partial<NewUserRow>): Promise<UserRow | undefined> {
    const [row] = await this.db.update(users).set(values).where(eq(users.id, id)).returning();
    return row;
  }
}
