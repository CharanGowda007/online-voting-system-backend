import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/auth/guards/permissions.guard';
import { Permissions } from '@/common/auth/decorators/permissions.decorator';
import { PostDetailsService } from '../service/postDetails.service';
import {
  CreatePostDetailsDto,
  PostDetailsQueryDto,
  UpdatePostDetailsDto,
} from '../dto/postDetails.dto';

@ApiTags('Post Details')
@Controller('post-details')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PostDetailsController {
  constructor(private readonly postDetailsService: PostDetailsService) {}

  @Post()
  @Permissions('POST_DETAILS:ADD')
  @ApiOperation({ summary: 'Create a post (insert to DB)' })
  @ApiResponse({ status: 201, description: 'Post created' })
  async create(@Body() dto: CreatePostDetailsDto) {
    return this.postDetailsService.create(dto);
  }

  @Get()
  @Permissions('POST_DETAILS:VIEW')
  @ApiOperation({ summary: 'List all posts (paginated and searchable)' })
  @ApiResponse({ status: 200, description: 'Paginated list of posts' })
  async findAll(@Query() query: PostDetailsQueryDto) {
    return this.postDetailsService.findAll(query);
  }

  @Put(':id')
  @Permissions('POST_DETAILS:UPDATE')
  @ApiOperation({ summary: 'Update a post by id (UUID)' })
  @ApiResponse({ status: 200, description: 'Post updated' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async update(@Param('id') id: string, @Body() dto: UpdatePostDetailsDto) {
    return this.postDetailsService.update(id, dto);
  }

  @Get(':id')
  @Permissions('POST_DETAILS:VIEW')
  @ApiOperation({ summary: 'Get post by id (UUID)' })
  @ApiResponse({ status: 200, description: 'Post' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(@Param('id') id: string) {
    return this.postDetailsService.getById(id);
  }
}