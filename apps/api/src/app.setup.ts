import type { INestApplication } from '@nestjs/common';
import { AppConfig } from './config';

/** Shared by main.ts and the tests, so tests run the app exactly as production does. */
export function setupApp(app: INestApplication): void {
  const config = app.get(AppConfig);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.corsOrigins });
  app.enableShutdownHooks();
}
