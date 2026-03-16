import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Enable global validation using class-validator
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // strip out fields not defined in the DTO
    forbidNonWhitelisted: true, // throw error if extra fields are sent
  }));
  
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(`Application successfully started and listening on port ${port}`);
}
bootstrap();
