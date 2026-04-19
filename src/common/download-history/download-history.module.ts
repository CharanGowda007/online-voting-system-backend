import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DownloadHistory } from './models/downloadHistory.entity';
import { DownloadHistoryService } from './services/downloadHistory.service';

@Module({
  imports: [TypeOrmModule.forFeature([DownloadHistory])],
  providers: [DownloadHistoryService],
  exports: [DownloadHistoryService],
})
export class DownloadHistoryModule {}