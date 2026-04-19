import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { getDatabaseConfig } from './config/database.config';
import { UserModule } from './common/user/user.module';
import { AuthModule } from './common/auth/auth.module';
import { DocumentUploaderModule } from 'src/common/document-uploader/document-uploader.module';
import { DownloadHistoryModule } from 'src/common/download-history/download-history.module';
import { MasterModule } from './master/master.module';

import { UserAdminModule } from './userAdmin/userAdmin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [
        '.env',
        `.env.${process.env.NODE_ENV || 'local'}`,
        '.env.local',
        '.env.dev',
        '.env.uat',
        '.env.prod',
      ],
      ignoreEnvFile: false,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    DocumentUploaderModule,
    DownloadHistoryModule,
    MasterModule,
    UserAdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}