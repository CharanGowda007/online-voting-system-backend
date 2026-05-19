import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.AmqpConnectionManager;
  private _channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const rabbitMqUri = this.configService.get<string>('RABBITMQ_URI');
    const queueName = this.configService.get<string>('RABBITMQ_QUEUE') || 'mail_queue';

    if (!rabbitMqUri) {
      this.logger.error('RABBITMQ_URI is not defined in the environment variables');
      return;
    }

    // Initialize the RabbitMQ connection
    this.connection = amqp.connect([rabbitMqUri]);

    this.connection.on('connect', () => {
      this.logger.log('Connected to RabbitMQ server');
    });

    this.connection.on('disconnect', (err) => {
      this.logger.error('Disconnected from RabbitMQ server', err.err.stack);
    });

    // Set up a channel wrapper
    this._channelWrapper = this.connection.createChannel({
      json: true,
      setup: (channel: amqplib.ConfirmChannel) => {
        // Setup the queue
        return channel.assertQueue(queueName, { durable: true });
      },
    });

    this.logger.log(`RabbitMQ service initialized with queue: ${queueName} --------------------->`);
  }

  get channelWrapper(): ChannelWrapper {
    return this._channelWrapper;
  }

  // Update sendToQueue to accept two parameters: queueName and message
  async sendToQueue(queueName: string, message: object) {
    try {
      if (!this._channelWrapper) {
        throw new Error('RabbitMQ channel not initialized');
      }
      await this._channelWrapper.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(message)), // Convert message object to string buffer
        {
          persistent: true, // Set message persistence
        } as amqplib.Options.Publish, // Cast to correct type if needed
      );
      console.log(`Message sent successfully to ${queueName}`);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  }

  async onModuleDestroy() {
    // Close the RabbitMQ connection on shutdown
    if (this.connection) {
      await this.connection.close();
    }
  }
}
