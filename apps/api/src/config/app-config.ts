import { envSchema, type Env } from './env.schema';

/** Typed, validated settings from environment variables. Fails fast on startup if anything is wrong. */
export class AppConfig {
  constructor(private readonly env: Env) {}

  static fromProcessEnv(): AppConfig {
    try {
      process.loadEnvFile();
    } catch {
      // no .env file: rely on real environment variables
    }
    return new AppConfig(envSchema.parse(process.env));
  }

  get isProduction() {
    return this.env.NODE_ENV === 'production';
  }
  get port() {
    return this.env.PORT;
  }
  get databaseUrl() {
    return this.env.DATABASE_URL;
  }
  get jwtSecret() {
    return this.env.JWT_SECRET;
  }
  get jwtExpiresInDays() {
    return this.env.JWT_EXPIRES_IN_DAYS;
  }
  get corsOrigins() {
    return this.env.CORS_ORIGINS.split(',').map((o) => o.trim());
  }
}
