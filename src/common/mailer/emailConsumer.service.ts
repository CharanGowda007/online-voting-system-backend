import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './mailer.service';
import { RabbitMQService } from './rabbitMq.service';

@Injectable()
export class EmailConsumerService implements OnModuleInit {
  private readonly logger = new Logger(EmailConsumerService.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const queueName = this.configService.get<string>('RABBITMQ_QUEUE') || 'mail_queue';
    
    // Listen to the queue
    const channelWrapper = this.rabbitMQService.channelWrapper;

    if (!channelWrapper) {
      this.logger.error('RabbitMQ channel wrapper not available');
      return;
    }

    channelWrapper.addSetup((channel) => {
      this.logger.log(`Setting up consumer for queue: ${queueName}`);
      return channel.consume(queueName, async (msg) => {
        if (msg !== null) {
          try {
            const emailData = JSON.parse(msg.content.toString());
            this.logger.log(`Processing email to: ${emailData.to}`);
            await this.emailService.sendEmail(emailData);
            channel.ack(msg); // Acknowledge the message after processing
          } catch (error) {
            this.logger.error(`Failed to process message: ${error.message}`);
            // Optionally nack the message so it can be retried or sent to DLQ
            channel.nack(msg, false, false);
          }
        }
      });
    });
  }
}
