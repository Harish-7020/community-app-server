import * as config from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as swaggerStats from 'swagger-stats';

config.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));  
  
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle(process.env.APP_NAME ?? `Niche Community`)
    .setDescription('API documentation for the ' + (process.env.APP_NAME || 'Niche Community'))
    .setVersion(process.env.APP_VERSION || '1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerStatsMiddleware = swaggerStats.getMiddleware({ swaggerSpec: document });
  app.use((req, res, next) => {
    return swaggerStatsMiddleware(req, res, next);  
  });
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  
  await app.listen(process.env.APP_PORT ?? 4005);
  console.log(`Server is running on port ${process.env.APP_PORT ?? 4005}`);
}
bootstrap();
