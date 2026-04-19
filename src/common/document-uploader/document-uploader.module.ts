import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentUploaderController } from './controller/document-uploader.controller';
import { DocumentUploaderService } from './services/document-uploader.service';
import { DocumentMetaInfo } from './models/documentmetainfo.model';
import { S3ClientModule } from '@/common/s3-client/s3-client.module';
import { DownloadHistoryModule } from '@/common/download-history/download-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentMetaInfo]),
    S3ClientModule,
    DownloadHistoryModule,
  ],
  controllers: [DocumentUploaderController],
  providers: [DocumentUploaderService],
  exports: [DocumentUploaderService],
})
export class DocumentUploaderModule {}