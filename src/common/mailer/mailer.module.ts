import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';
import { RabbitMQService } from './rabbitMq.service';
import { MailerController } from './mailer.controller';
import { EmailService } from './mailer.service';
import { EmailConsumerService } from './emailConsumer.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    NestMailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('SMTP_HOST'),
          port: config.get<number>('SMTP_PORT'),
          secure: config.get('SMTP_SECURE') === 'true' || config.get('SMTP_SECURE') === true,
          auth: {
            user: config.get<string>('SMTP_USERNAME'),
            pass: config.get<string>('SMTP_PASSWORD'),
          },
          family: 4,
        },
        defaults: {
          from: config.get<string>('mail.FROM'),
        },
        template: {
          dir: join(__dirname, '../mail/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RabbitMQService, EmailService, EmailConsumerService],
  controllers: [MailerController],
  exports: [RabbitMQService, EmailService],
})
export class MailerModule {}
