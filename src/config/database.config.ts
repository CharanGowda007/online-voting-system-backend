import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { BlackListedTokens } from '@/common/auth/models/blackListTokens.model';
import { User } from '@/common/user/entity/user.entity';
import { Role } from '@/common/user/entity/role.entity';
import { RolePermission } from '@/common/user/entity/rolePermission.entity';
import { Permission } from '@/common/user/entity/permission.entity';
import { RoleMenu } from '@/common/user/entity/roleMenu.entity';
import { LoginHistory } from '@/common/user/entity/loginHistory.entity';
import { SeriesGenerator } from '@/series-generator/model/series-generator.entity';
import { PersonalDetails } from '@/userAdmin/models/personalDetails.entity';
import { PostDetails } from '@/userAdmin/models/postDetails.entity';
import { PostHierarchy } from '@/userAdmin/models/postHierarchy.entity';
import { PostPersonMapping } from '@/userAdmin/models/postPersonMapping.entity';
import { PostPermission } from '@/userAdmin/models/postPermission.entity';
import { PostPermissionLimit } from '@/userAdmin/models/postPermissionLimit.entity';
import { PostManagerMapping } from '@/userAdmin/models/postManagerMapping.entity';
import { DocumentMetaInfo } from '@/common/document-uploader/models/documentmetainfo.model';
import { MasterCountry } from '@/master/models/masterCountry.entity';
import { MasterState } from '@/master/models/masterState.entity';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('NODE_ENV');
  const isProduction = nodeEnv === 'production';
  const isUAT = nodeEnv === 'uat';

  return {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(configService.get<string>('DB_PORT', '3306'), 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [
      BlackListedTokens,
      User,
      Role,
      RolePermission,
      Permission,
      RoleMenu,
      LoginHistory,
      SeriesGenerator,
      PersonalDetails,
      PostDetails,
      PostHierarchy,
      PostPersonMapping,
      PostPermission,
      PostPermissionLimit,
      PostManagerMapping,
      DocumentMetaInfo,
      MasterCountry,
      MasterState,
    ],
    autoLoadEntities: true,
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],

    // Keep false to prevent TypeORM from dropping/altering tables on restart. Use migrations for schema changes.
    // Keep false to prevent data loss on restart. Set DB_SYNCHRONIZE=true only for local schema dev; use migrations otherwise.
    synchronize: configService.get<boolean>('database.synchronize', false),
    logging: configService.get<boolean>('database.logging', false),
    logger: configService.get<
      | 'advanced-console'
      | 'debug'
      | 'simple-console'
      | 'formatted-console'
      | 'file'
    >('database.logger', 'advanced-console'),
    maxQueryExecutionTime: configService.get<number>(
      'database.maxQueryExecutionTime',
      1000,
    ),
    extra: {
      connectionLimit: configService.get<number>(
        'database.connectionLimit',
        10,
      ),
      ssl: isProduction
        ? {
          rejectUnauthorized: false,
          ca: configService.get<string>('database.ssl.ca'),
          cert: configService.get<string>('database.ssl.cert'),
          key: configService.get<string>('database.ssl.key'),
        }
        : false,
      supportBigNumbers: true,
      bigNumberStrings: false,
      dateStrings: false,
      debug: configService.get<boolean>('database.debug', false),
      multipleStatements: false,
      flags: ['-FOUND_ROWS'],
    },
    migrationsRun: isProduction || isUAT,
    migrationsTableName: 'typeorm_migrations',
    entitySkipConstructor: true,
    name: configService.get<string>('database.connectionName', 'default'),
  };
};
