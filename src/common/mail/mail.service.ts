import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

interface MailOptions {
  to: string[];
  bcc?: string[];
  subject: string;
  template: string;
  context: any;
}

interface SMTPError extends Error {
  code?: string;
  command?: string;
  responseCode?: number;
  response?: string;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private isTransporterReady: boolean = false;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      const smtpConfig = {
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT'),
        secure: this.configService.get<boolean>('SMTP_SECURE'),
        auth: {
          user: this.configService.get<string>('SMTP_USERNAME'),
          pass: this.configService.get<string>('SMTP_APP_PASSWORD'),
        },
        tls: {
          rejectUnauthorized: false,
        },
        debug: true,
        logger: true,
      };

      // Debug logs
      this.logger.debug('SMTP Configuration:', {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        username: smtpConfig.auth.user,
        passwordLength: smtpConfig.auth.pass ? smtpConfig.auth.pass.length : 0,
      });

      this.transporter = nodemailer.createTransport(smtpConfig);

      // Verify SMTP connection with better error handling
      await new Promise<void>((resolve, reject) => {
        this.transporter.verify((error: SMTPError, success) => {
          if (error) {
            this.logger.error('SMTP Connection Error:', {
              message: error.message,
              code: error.code,
              command: error.command,
              responseCode: error.responseCode,
              response: error.response,
              stack: error.stack,
            });
            this.isTransporterReady = false;
            this.logger.warn('Mail service will be disabled due to SMTP connection issues');
            resolve(); // Resolve instead of reject to prevent startup failure
          } else {
            this.logger.log('SMTP Connection Success:', success);
            this.isTransporterReady = true;
            resolve();
          }
        });
      });
    } catch (error) {
      this.logger.error('Failed to initialize mail transporter:', {
        error: error.message,
        stack: error.stack,
      });
      this.isTransporterReady = false;
      this.logger.warn('Mail service will be disabled due to initialization failure');
    }
  }

  async sendMail(options: MailOptions): Promise<void> {
    if (!this.isTransporterReady) {
      this.logger.error('Cannot send email: SMTP transporter is not ready', {
        recipient: options.to,
        subject: options.subject,
      });
      return; // Return silently instead of throwing error
    }

    try {
      this.logger.debug('Sending email to:', options.to);
      this.logger.debug('Using template:', options.template);

      const templatePath = path.join(process.cwd(), 'src/common/mail/templates', `${options.template}.hbs`);
      this.logger.debug('Template path:', templatePath);

      const template = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = handlebars.compile(template);
      const html = compiledTemplate(options.context);

      const mailOptions = {
        from: this.configService.get<string>('mail.FROM'),
        to: options.to,
        bcc: options.bcc,
        subject: options.subject,
        html: html,
      };
      this.logger.debug('Mail options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
      });

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error('Email sending error:', {
        error: error.message,
        stack: error.stack,
        recipient: options.to,
        subject: options.subject,
      });
      // Don't throw error, just log it
    }
  }
}
