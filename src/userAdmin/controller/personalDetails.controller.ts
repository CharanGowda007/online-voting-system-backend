import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/auth/guards/permissions.guard';
import { Permissions } from '@/common/auth/decorators/permissions.decorator';
import { UserAdminPersonalDetailsService } from '../service/personalDetails.service';
import {
  CreatePersonalDetailsDto,
  PersonalDetailsQueryDto,
} from '../dto/personalDetails.dto';

@ApiTags('Persons (Personal Details)')
@Controller('persons')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PersonalDetailsController {
  constructor(
    private readonly personalDetailsService: UserAdminPersonalDetailsService,
  ) {}

  @Post()
  @Permissions('PERSONAL_DETAILS:ADD')
  @ApiOperation({ summary: 'Create a person (insert to DB)' })
  @ApiResponse({ status: 201, description: 'Person created' })
  async create(@Body() dto: CreatePersonalDetailsDto) {
    return this.personalDetailsService.create(dto);
  }

  @Post('seed')
  @Permissions('PERSONAL_DETAILS:SEED')
  @ApiOperation({ summary: 'Seed first N person details (default 50)' })
  @ApiResponse({ status: 201, description: 'Persons created' })
  async seed(@Query('count') count?: string) {
    const n = count ? parseInt(count, 10) : 50;
    return this.personalDetailsService.seed(Number.isNaN(n) ? 50 : n);
  }

  @Get()
  @Permissions('PERSONAL_DETAILS:VIEW')
  @ApiOperation({ summary: 'List all persons (paginated and searchable)' })
  @ApiResponse({ status: 200, description: 'Paginated list of persons' })
  async findAll(@Query() query: PersonalDetailsQueryDto) {
    return this.personalDetailsService.findAll(query);
  }

  @Get(':id')
  @Permissions('PERSONAL_DETAILS:VIEW')
  @ApiOperation({ summary: 'Get person by id (UUID)' })
  @ApiResponse({ status: 200, description: 'Person' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  async findOne(@Param('id') id: string) {
    return this.personalDetailsService.findOneById(id);
  }
}