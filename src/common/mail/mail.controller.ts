import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test')
  async testEmail(@Body() body: { to: string[] }) {
    try {
      await this.mailService.sendMail({
        to: body.to,
        subject: 'Test Email from KEONICS',
        template: 'test-email',
        context: {
          message: 'This is a test email from KEONICS system.',
          timestamp: new Date().toISOString(),
        },
      });
      return { message: 'Test email sent successfully' };
    } catch (error) {
      return {
        error: 'Failed to send test email',
        details: error.message,
      };
    }
  }
}

