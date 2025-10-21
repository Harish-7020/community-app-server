import * as config from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

config.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));  
  
  // Enable global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // Enable CORS with proper configuration for WebSocket
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:4005',
      'http://127.0.0.1:4005'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: true,
  });
  
  await app.listen(process.env.APP_PORT ?? 4005);
  console.log(`Server is running on port ${process.env.APP_PORT ?? 4005}`);
}
bootstrap();
