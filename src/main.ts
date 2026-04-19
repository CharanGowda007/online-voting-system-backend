import {
  HttpException,
  HttpStatus,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { collectDefaultMetrics, register } from 'prom-client';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  addTransactionalDataSource(app.get(DataSource));

  const helmetEnabled = process.env.ENABLE_HELMET === 'true';
  const cspEnabled = process.env.ENABLE_CSP === 'true';
  const hstsEnabled = process.env.ENABLE_HSTS === 'true';
  const hstsMaxAge = parseInt(process.env.HSTS_MAX_AGE ?? '31536000', 10);

  if (helmetEnabled) {
    app.use(
      helmet({
        contentSecurityPolicy: cspEnabled
          ? {
              directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
              },
            }
          : false,
        crossOriginEmbedderPolicy: false,
        hsts: hstsEnabled
          ? {
              maxAge: hstsMaxAge,
              includeSubDomains: true,
              preload: true,
            }
          : false,
        noSniff: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        frameguard: { action: 'deny' },
      }),
    );
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: errors => {
        const fieldErrors = errors.map(err => ({
          field: err.property,
          message: Object.values(err.constraints ?? {}).join('. '),
        }));
        return new HttpException(
          {
            statusCode: 400,
            error: 'Validation Failed',
            errors: fieldErrors,
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );

  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());

  const corsOrigin =
    process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) ?? [
      'http://localhost:3000',
      'http://localhost:5173',
    ];

  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });

  const enableSwagger = process.env.ENABLE_SWAGGER === 'true';

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('CAS Backend API')
      .setDescription('CAS Backend API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    logger.log('Swagger available at /api/docs');
  }

  collectDefaultMetrics({ register });

  const port =
    parseInt(process.env.APP_PORT ?? '3000', 10) ||
    parseInt(process.env.PORT ?? '3000', 10) ||
    3500;

  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);

  if (enableSwagger) {
    logger.log(`Swagger: http://localhost:${port}/api/docs`);
  }
}

bootstrap();