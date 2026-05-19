import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rabbitMq.service';

@Controller('email')
export class MailerController {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly configService: ConfigService,
  ) {}

  @Post('send')
  async sendEmail(@Body() emailData: { to: string; subject: string; text: string }) {
    try {
      const queueName = this.configService.get<string>('RABBITMQ_QUEUE') || 'mail_queue';
      
      // Call sendToQueue with the correct parameters: queueName and message
      await this.rabbitMQService.sendToQueue(queueName, emailData);
      
      return { message: 'Email request submitted successfully.' };
    } catch (error) {
      throw new HttpException(
        `Failed to submit email request: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
