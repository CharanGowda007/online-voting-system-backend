import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/auth/guards/permissions.guard';
import { Permissions } from '@/common/auth/decorators/permissions.decorator';
import { CreatePostPermissionDto } from '../dto/postPermission.dto';
import { PostPermissionService } from '../service/postPermission.service';

@ApiTags('Post Permissions')
@Controller('post-permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PostPermissionController {
  constructor(private readonly postPermissionService: PostPermissionService) {}

  @Post()
  @Permissions('POST_PERMISSIONS:ADD')
  @ApiOperation({ summary: 'Assign a permission to a post' })
  @ApiResponse({ status: 201, description: 'Post permission created' })
  async create(@Body() dto: CreatePostPermissionDto) {
    return this.postPermissionService.create(dto);
  }

  @Get()
  @Permissions('POST_PERMISSIONS:VIEW')
  @ApiOperation({ summary: 'List all post permissions' })
  @ApiResponse({ status: 200, description: 'List of post permissions' })
  async findAll() {
    return this.postPermissionService.findAll();
  }

  @Get('post/:postId')
  @Permissions('POST_PERMISSIONS:VIEW')
  @ApiOperation({ summary: 'Get permissions for a post' })
  @ApiResponse({ status: 200, description: 'List of permissions for the post' })
  async getByPostId(@Param('postId') postId: string) {
    return this.postPermissionService.fetchPermissionsByPostId(postId);
  }

  @Get(':id')
  @Permissions('POST_PERMISSIONS:VIEW')
  @ApiOperation({ summary: 'Get post permission by id' })
  @ApiResponse({ status: 200, description: 'Post permission' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.postPermissionService.getById(id);
  }
}
