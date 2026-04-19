import { forwardRef, Logger, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/common/auth/auth.module';
import { CachingUtil } from '@/common/core/utils/caching.util';
import { PersonalDetails } from '@/userAdmin/models/personalDetails.entity';
import { UserAdminModule } from '@/userAdmin/userAdmin.module';
import { UserController } from './controller/user.controller';
import { UsersController } from './controller/users.controller';
import { PublicController } from './controller/public.controller';
import { RoleController } from './controller/role.controller';
import { Permission } from './entity/permission.entity';
import { Role } from './entity/role.entity';
import { RolePermission } from './entity/rolePermission.entity';
import { User } from './entity/user.entity';
import { LoginHistory } from './entity/loginHistory.entity';
import { RoleMenu } from './entity/roleMenu.entity';
import { PermissionService } from './service/permission.service';
import { RoleService } from './service/role.service';
import { RolePermissionService } from './service/rolePermission.service';
import { RoleMenuService } from './service/roleMenu.service';
import { UserService } from './service/user.service';
import { PublicService } from './service/public.service';
import { LoginHistoryService } from './service/loginHistory.service';
import { SeriesGeneratorModule } from '@/series-generator/series-generator.module';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([
      User,
      RolePermission,
      Role,
      Permission,
      PersonalDetails,
      RoleMenu,
      LoginHistory,
    ]),
    forwardRef(() => UserAdminModule),
    JwtModule.register({}),
    SeriesGeneratorModule,
    AuthModule,
  ],
  providers: [
    UserService,
    Logger,
    CachingUtil,
    JwtService,
    RolePermissionService,
    PermissionService,
    RoleService,
    PublicService,
    RoleMenuService,
    LoginHistoryService,
  ],
  controllers: [
    UserController,
    UsersController,
    PublicController,
    RoleController,
  ],
  exports: [
    UserService,
    Logger,
    PermissionService,
    RoleService,
    RolePermissionService,
    PublicService,
    RoleMenuService,
    LoginHistoryService,
    CachingUtil,
  ],
})
export class UserModule { }
