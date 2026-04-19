import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DownloadHistory } from '../models/downloadHistory.entity';
import { Request } from 'express';

@Injectable()
export class DownloadHistoryService {
  private readonly logger = new Logger(DownloadHistoryService.name);

  constructor(
    @InjectRepository(DownloadHistory)
    private readonly repo: Repository<DownloadHistory>,
  ) {}

  async logDownload(data: {
    fileKey: string;
    fileName?: string;
    module: string;
    entityId?: number;
    userId: string;
    req: Request;
  }) {
    try {
      const history = this.repo.create({
        fileKey: data.fileKey,
        fileName: data.fileName,
        module: data.module,
        entityId: data.entityId,
        downloadedBy: data.userId,
        ipAddress: (data.req as any).ip,
        userAgent: (data.req as any).headers['user-agent'],
      });

      await this.repo.save(history);
      this.logger.log(
        `Download logged for file: ${data.fileKey} by user: ${data.userId} `,
      );
    } catch (error) {
      this.logger.error(
        `Failed to log download history: ${error.message} `,
        error.stack,
      );
    }
  }

  async getHistoryByEntity(
    entityId: number,
    module: string,
  ): Promise<DownloadHistory[]> {
    return await this.repo.find({
      where: { entityId, module },
      order: { downloadedAt: 'DESC' },
    });
  }

  async getHistoryByUser(downloadedBy: string): Promise<DownloadHistory[]> {
    return await this.repo.find({
      where: { downloadedBy },
      order: { downloadedAt: 'DESC' },
    });
  }
}