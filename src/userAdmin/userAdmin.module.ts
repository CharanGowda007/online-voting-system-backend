import { forwardRef, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/common/auth/auth.module';
import { CachingUtil } from '@/common/core/utils/caching.util';
import { RolePermission } from '@/common/user/entity/rolePermission.entity';
import { User } from '@/common/user/entity/user.entity';
import { Role } from '@/common/user/entity/role.entity';
import { UserModule } from '@/common/user/user.module';
import { SeriesGeneratorModule } from '@/series-generator/series-generator.module';
import { PersonalDetails } from './models/personalDetails.entity';
import { PostDetails } from './models/postDetails.entity';
import { PostHierarchy } from './models/postHierarchy.entity';
import { PostManagerMapping } from './models/postManagerMapping.entity';
import { PostPermission } from './models/postPermission.entity';
import { PostPermissionLimit } from './models/postPermissionLimit.entity';
import { PostPersonMapping } from './models/postPersonMapping.entity';
import { PersonalDetailsController } from './controller/personalDetails.controller';
import { PostDetailsController } from './controller/postDetails.controller';
import { PostPersonMappingController } from './controller/postPersonMapping.controller';
import { PostPermissionController } from './controller/postPermission.controller';
import { UserAdminPersonalDetailsService } from './service/personalDetails.service';
import { PostDetailsService } from './service/postDetails.service';
import { PostHierarchyService } from './service/postHierarchy.service';
import { PostManagerMappingService } from './service/postManagerMapping.service';
import { PostPermissionService } from './service/postPermission.service';
import { PostPermissionLimitService } from './service/postPermissionLimit.service';
import { PostPersonMappingService } from './service/postPersonMapping.service';

@Module({
  imports: [
    AuthModule,
    CacheModule.register(),
    TypeOrmModule.forFeature([
      User,
      PersonalDetails,
      PostPermission,
      PostPermissionLimit,
      PostDetails,
      PostHierarchy,
      PostPersonMapping,
      RolePermission,
      PostManagerMapping,
      Role,
    ]),
    forwardRef(() => UserModule),
    SeriesGeneratorModule,
  ],
  controllers: [
    PersonalDetailsController,
    PostDetailsController,
    PostPersonMappingController,
    PostPermissionController,

  ],
  providers: [
    JwtService,
    CachingUtil,
    UserAdminPersonalDetailsService,
    PostDetailsService,
    PostHierarchyService,
    PostPersonMappingService,
    PostPermissionService,
    PostPermissionLimitService,
    PostManagerMappingService,
  ],
  exports: [
    UserAdminPersonalDetailsService,
    PostDetailsService,
    PostHierarchyService,
    PostPersonMappingService,
    PostPermissionService,
    PostPermissionLimitService,
    PostManagerMappingService,
  ],
})
export class UserAdminModule {}