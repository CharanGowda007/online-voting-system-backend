import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { BufferedFile } from 'src/common/s3-client/file.model';
import { DocumentMetaInfo } from 'src/common/document-uploader/models/documentmetainfo.model';
import { Readable } from 'stream';

@Injectable()
export class S3ClientService implements OnModuleInit {
  private readonly logger = new Logger(S3ClientService.name);
  private s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const s3Config = this.configService.get('s3');
    this.bucket = s3Config.bucket;

    this.s3Client = new S3Client({
      endpoint: s3Config.endpoint,
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKey,
        secretAccessKey: s3Config.secretKey,
      },
      forcePathStyle: true, // Required for Minio
    });
  }

  onModuleInit() {
    this.logger.log(
      'S3 Client initialized connecting to ' +
        this.configService.get('s3.endpoint'),
    );
  }

  async upload(
    file: BufferedFile,
    meta: DocumentMetaInfo,
  ): Promise<{ url: string; key: string; fileName: string }> {
    const key = `${meta.entityType}/${meta.entityId}/${Date.now()}-${file.originalname}`;

    try {
      const parallelUploads3 = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      });

      await parallelUploads3.done();

      this.logger.log(`Successfully uploaded file to S3: ${key}`);

      const url = `${this.configService.get('s3.endpoint')}/${this.bucket}/${key}`;
      return {
        url: url,
        key: key,
        fileName: file.originalname,
      };
    } catch (error) {
      this.logger.error(`Error uploading file to S3: ${error.message}`);
      throw error;
    }
  }

  async downloadFile(key: string): Promise<{ Body: Readable | any }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      return { Body: response.Body };
    } catch (error) {
      this.logger.error(`Error downloading file from S3: ${error.message}`);
      throw error;
    }
  }

  async getMetaData(key: string): Promise<any | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      return response;
    } catch (error) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return null;
      }
      this.logger.error(`Error getting metadata from S3: ${error.message}`);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Successfully deleted file from S3: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting file from S3: ${error.message}`);
      throw error;
    }
  }
}

