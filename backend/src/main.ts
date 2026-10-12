import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  // whitelist strips unknown fields so clients can't inject extra properties
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  if (process.env.CORS_ORIGIN) {
    app.enableCors({ origin: process.env.CORS_ORIGIN });
  }

  const config = new DocumentBuilder()
    .setTitle('Broken Empires Vault API')
    .setDescription('REST API for the Broken Empires Vault')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Served at /api/docs (the global prefix applies via the useGlobalPrefix option)
  SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
