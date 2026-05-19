import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(emailData: { to: string; subject: string; text: string }) {
    this.logger.log(`Attempting to send plain email to ${emailData.to}...`);
    try {
      await this.mailerService.sendMail({
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
      });
      this.logger.log(`Email sent successfully to ${emailData.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${emailData.to}:`, error);
    }
  }

  async sendRegistrationEmail(to: string, name: string, loginId: string, password: string) {
    this.logger.log(`Preparing registration email for ${to}...`);
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Welcome to VoteSecure - Registration Successful',
        template: './registration',
        context: {
          name,
          loginId,
          password,
          loginUrl: 'http://localhost:5173/login',
        },
      });
      this.logger.log(`Registration email dispatched successfully to ${to}`);
    } catch (error) {
      this.logger.error(`CRITICAL: Failed to dispatch registration email to ${to}:`, error);
      if (error.response) {
        this.logger.error('SMTP Response Details:', JSON.stringify(error.response));
      }
    }
  }

  async sendPasswordResetEmail(to: string, tempPassword: string) {
    this.logger.log(`Preparing password reset email for ${to}...`);
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Password Reset - VoteSecure',
        template: './password_reset',
        context: {
          tempPassword,
        },
      });
      this.logger.log(`Password reset email dispatched successfully to ${to}`);
    } catch (error) {
      this.logger.error(`CRITICAL: Failed to dispatch password reset email to ${to}:`, error);
    }
  }
}
