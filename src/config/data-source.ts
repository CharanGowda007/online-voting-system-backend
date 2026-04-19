/**
 * Standalone DataSource for TypeORM CLI (schema:sync, migrations).
 * Loads .env from project root. Run: npm run db:sync
 */
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

import { BlackListedTokens } from '../common/auth/models/blackListTokens.model';
import { User } from '../common/user/entity/user.entity';
import { Role } from '../common/user/entity/role.entity';
import { RolePermission } from '../common/user/entity/rolePermission.entity';
import { Permission } from '../common/user/entity/permission.entity';
import { RoleMenu } from '../common/user/entity/roleMenu.entity';
import { LoginHistory } from '../common/user/entity/loginHistory.entity';
import { SeriesGenerator } from '../series-generator/model/series-generator.entity';
import { PersonalDetails } from '../userAdmin/models/personalDetails.entity';
import { PostDetails } from '../userAdmin/models/postDetails.entity';
import { PostHierarchy } from '../userAdmin/models/postHierarchy.entity';
import { PostPersonMapping } from '../userAdmin/models/postPersonMapping.entity';
import { PostPermission } from '../userAdmin/models/postPermission.entity';
import { PostPermissionLimit } from '../userAdmin/models/postPermissionLimit.entity';
import { PostManagerMapping } from '../userAdmin/models/postManagerMapping.entity';
import { DocumentMetaInfo } from '../common/document-uploader/models/documentmetainfo.model';
import { MasterCountry } from '../master/models/masterCountry.entity';
import { MasterState } from '../master/models/masterState.entity';


export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || process.env.DB_NAME || 'CAS',
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
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
});

