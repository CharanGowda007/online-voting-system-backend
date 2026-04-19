import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '@/common/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/auth/guards/permissions.guard';
import { Permissions } from '@/common/auth/decorators/permissions.decorator';
import {
  HeaderUtil,
  PageLike,
  PageRequestLike,
} from '@/common/core/utils/header-util';
import {
  CreatePostPersonMappingDto,
  PostPersonMappingDTO,
} from '../dto/postPersonMapping.dto';
import { PostPersonMapping } from '../models/postPersonMapping.entity';
import { PostPersonMappingService } from '../service/postPersonMapping.service';
import { PostPersonMappingStatus } from '../enums/postPersonMappingStatus';

@ApiTags('Post Person Mapping')
@Controller('post-person-mapping')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PostPersonMappingController {
  logger = new Logger(PostPersonMappingController.name);

  constructor(
    private readonly postPersonMappingService: PostPersonMappingService,
  ) {}

  @UseGuards(PermissionsGuard)
  @Permissions('POST_PERSON_MAPPING:VIEW')
  @Get('person/:id/all-mappings')
  @ApiOperation({ summary: 'List all mappings (paginated)' })
  @ApiResponse({ status: 200, description: 'List all records' })
  @ApiResponse({ status: 404, description: 'No records found' })
  async getAll(
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
    @Query('sort', new DefaultValuePipe('ASC')) sort: string,
    @Req() req: { user?: { userId?: string } },
    @Res() res: Response,
  ): Promise<void> {
    try {
      const loginId = req.user?.userId ?? 'anonymous';
      this.logger.log(`User ${loginId} requesting to get all mappings`);

      const normalizedSort =
        sort && !sort.includes(',')
          ? sort.toUpperCase() === 'DESC'
            ? 'id,DESC'
            : 'id,ASC'
          : sort;
      const [sortProp, sortDir] = normalizedSort.split(',');
      const order = {
        [sortProp?.trim() || 'id']: (sortDir?.trim() || 'ASC') as
          | 'ASC'
          | 'DESC',
      };

      const skip = page * size;
      const [results, count] = await this.postPersonMappingService.findAndCount(
        {
          skip,
          take: size,
          order,
        },
      );

      if (!results.length) {
        this.logger.warn(`User ${loginId}: Not found.`);
        res.status(HttpStatus.NOT_FOUND).json({ message: 'No records found' });
        return;
      }

      const pageRequest: PageRequestLike = { page, size, sort: normalizedSort };
      const pageResult: PageLike<PostPersonMapping> = {
        content: results,
        totalElements: count,
        pageRequest,
      };
      HeaderUtil.addPaginationHeaders(res, pageResult);
      res.status(HttpStatus.OK).json({
        message: 'Fetched records successfully.',
        data: results,
      });
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Failed to fetch: ${err.message}`, err.stack);
      res
        .status(
          (error as HttpException)?.getStatus?.() ??
            HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json({ message: err.message ?? 'Internal server error' });
    }
  }

  @UseGuards(PermissionsGuard)
  @Permissions('POST_PERSON_MAPPING:ADD')
  @Post('postId/:postId/personId/:personId/mapping')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Map a person to a post (BDA-style path)' })
  @ApiCreatedResponse({ description: 'Created successfully' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Mandatory fields missing' })
  async map(
    @Body() dto: PostPersonMappingDTO,
    @Param('postId') postId: string,
    @Param('personId') personId: string,
    @Req() req: { user?: { userId?: string } },
  ): Promise<PostPersonMapping> {
    const loginId = req.user?.userId ?? 'anonymous';
    this.logger.log(
      `User ${loginId}: POST mapping postId=${postId} personId=${personId}`,
    );
    return this.postPersonMappingService.mapping(postId, personId, dto);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('POST_PERSON_MAPPING:ADD')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Map a person to a post (body: postId, personId)' })
  @ApiCreatedResponse({ description: 'Mapping created' })
  @ApiNotFoundResponse({ description: 'Post or person not found' })
  @ApiResponse({ status: 409, description: 'Person already mapped' })
  async create(
    @Body() dto: CreatePostPersonMappingDto,
    @Req() _req: { user?: { userId?: string } },
  ): Promise<PostPersonMapping> {
    return this.postPersonMappingService.create(dto);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('POST_PERSON_MAPPING:UPDATE')
  @Put(':id')
  @ApiOperation({ summary: 'Update post person mapping by id' })
  @ApiResponse({ status: 200, description: 'Updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async putId(
    @Req() req: { user?: { userId?: string } },
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PostPersonMappingDTO,
  ): Promise<void> {
    try {
      const loginId = req.user?.userId ?? 'anonymous';
      const updater = req.user?.userId ?? 'system';
      HeaderUtil.addEntityCreatedHeaders(res, 'PostPersonMapping', id);
      const update = await this.postPersonMappingService.update(
        dto,
        updater,
        id,
      );
      this.logger.log(`User ${loginId}: Updated mapping id ${id}`);
      res.status(HttpStatus.OK).json({
        message: 'Post Person Mapping updated successfully',
        data: update,
      });
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Update failed: ${err.message}`, err.stack);
      res
        .status(
          (error as HttpException)?.getStatus?.() ??
            HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json({
          success: false,
          message: err.message ?? 'Internal server error',
          statusCode: (error as HttpException)?.getStatus?.() ?? 500,
        });
    }
  }

  @UseGuards(PermissionsGuard)
  @Permissions('POST_PERSON_MAPPING:DELETE')
  @Delete(':id/person/:postId/mapping')
  @ApiOperation({
    summary: 'Delete (soft) post person mapping by id and postId',
  })
  @ApiResponse({ status: 200, description: 'Unassigned successfully' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  async deleteById(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Param('postId') postId: string,
    @Req() req: { user?: { userId?: string } },
  ): Promise<void> {
    try {
      const loginId = req.user?.userId ?? 'anonymous';
      this.logger.log(
        `User ${loginId}: Delete mapping id=${id} postId=${postId}`,
      );
      await this.postPersonMappingService.deleteById(id, postId);
      HeaderUtil.addEntityDeletedHeaders(res, 'Post Person Mapping', id);
      res
        .status(HttpStatus.OK)
        .json({ message: 'Post Person Mapping Unassigned successfully' });
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Delete failed: ${err.message}`, err.stack);
      if (
        error instanceof HttpException &&
        error.getStatus() === HttpStatus.NOT_FOUND
      ) {
        res.status(HttpStatus.NOT_FOUND).json({ message: 'Record not found' });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    }
  }

  @UseGuards(PermissionsGuard)
  @Permissions('POST_PERSON_MAPPING:VIEW')
  @Get('postId/:postId')
  @ApiOperation({
    summary: 'Get post person mapping with person details (BDA-style)',
  })
  @ApiResponse({ status: 200, description: 'Mapping and person details' })
  async getPostPersonMapping(
    @Param('postId') postId: string,
  ): Promise<unknown> {
    return this.postPersonMappingService.getPostPersonMapping(postId);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('POST_PERSON_MAPPING:VIEW')
  @Get('postId/person/unmapped-persons')
  @ApiOperation({ summary: 'Get unmapped persons (BDA-style path)' })
  @ApiResponse({ status: 200, description: 'List of unmapped persons' })
  async getUnmappedPersons(): Promise<unknown> {
    return this.postPersonMappingService.getUnmappedPersons();
  }

  @UseGuards(PermissionsGuard)
  @Permissions('POST_PERSON_MAPPING:UPDATE')
  @Put(':id/unmapped/update-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unmap by setting status to INACTIVE (BDA-style)' })
  @ApiOkResponse({ description: 'Status updated' })
  @ApiNotFoundResponse({ description: 'Not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostPersonMapping> {
    return this.postPersonMappingService.updateStatus(id);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('POST_PERSON_MAPPING:VIEW')
  @Get(':id/history/process-history')
  @ApiOperation({
    summary: 'Get process history (inactive mappings) for a post',
  })
  @ApiResponse({ status: 200, description: 'Paginated process history' })
  async getProcessHistory(
    @Param('id') postId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sort', new DefaultValuePipe('ASC')) sort: string,
  ): Promise<unknown> {
    const options = { page, limit };
    return this.postPersonMappingService.getProcessHistory(
      options,
      sort,
      postId,
    );
  }

  @UseGuards(PermissionsGuard)
  @Permissions('POST_PERSON_MAPPING:VIEW')
  @Get('postName/:postName')
  @ApiOperation({ summary: 'Get person details for post name (BDA-style)' })
  @ApiResponse({ status: 200, description: 'Mapping and person details' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getPersonDetailsforthePostName(
    @Param('postName') postName: string,
  ): Promise<unknown> {
    return this.postPersonMappingService.getPersonDetailsforthePostName(
      postName,
    );
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('POST_PERSON_MAPPING:VIEW')
  @Get('all-with-details')
  @ApiOperation({
    summary: 'Get all mappings with post and person details (BDA-style)',
    description:
      'Supports pagination (page, limit), status filter (ACTIVE/INACTIVE), and search by post name or person name.',
  })
  @ApiOkResponse({ description: 'List of mappings with details' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAllMappingsWithDetails(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<unknown> {
    const options = { page: page ?? 1, limit: limit ?? 10 };
    const mappingStatus =
      status?.toUpperCase() === PostPersonMappingStatus.ACTIVE
        ? PostPersonMappingStatus.ACTIVE
        : status?.toUpperCase() === PostPersonMappingStatus.INACTIVE
          ? PostPersonMappingStatus.INACTIVE
          : undefined;
    return this.postPersonMappingService.getAllMappingsWithDetails(
      options,
      mappingStatus,
      search,
    );
  }

  @UseGuards(PermissionsGuard)
  @Permissions('POST_PERSON_MAPPING:VIEW')
  @Get()
  @ApiOperation({ summary: 'List all post-person mappings' })
  @ApiResponse({ status: 200, description: 'List of mappings' })
  async findAll(): Promise<PostPersonMapping[]> {
    return this.postPersonMappingService.findAll();
  }

  @UseGuards(PermissionsGuard)
  @Permissions('POST_PERSON_MAPPING:VIEW')
  @Get('post/:postId')
  @ApiOperation({ summary: 'Get active mapping for a post' })
  @ApiResponse({ status: 200, description: 'Mapping or null' })
  async getByPostId(
    @Param('postId') postId: string,
  ): Promise<PostPersonMapping | null> {
    return this.postPersonMappingService.getByPostId(postId);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('POST_PERSON_MAPPING:VIEW')
  @Get(':id')
  @ApiOperation({ summary: 'Get mapping by id' })
  @ApiResponse({ status: 200, description: 'Mapping' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostPersonMapping> {
    return this.postPersonMappingService.getById(id);
  }
}