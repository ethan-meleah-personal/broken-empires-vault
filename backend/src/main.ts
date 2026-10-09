import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api'); // prefix every route with /api

  // In local dev the Angular dev server proxies /api, so CORS is only
  // needed when the frontend is hosted on a different origin.
  if (process.env.CORS_ORIGIN) {
    app.enableCors({ origin: process.env.CORS_ORIGIN });
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
