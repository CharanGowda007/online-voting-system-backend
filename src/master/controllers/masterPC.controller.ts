import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { MasterPCService } from '../services/masterPC.service';
import { CreateMasterPCDto, UpdateMasterPCDto } from '../dto/masterPC.dto';
import { MasterPCMapper } from '../mappers/masterPC.mapper';

@Controller('master/pc')
export class MasterPCController {
  constructor(private readonly masterPCService: MasterPCService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMasterPCDto) {
    const entity = await this.masterPCService.create(dto);
    return MasterPCMapper.toResponse(entity);
  }

  @Get()
  async findAll(@Query('stateCode') stateCode?: string) {
    if (stateCode) {
      const entities = await this.masterPCService.findByState(Number(stateCode));
      return entities.map(MasterPCMapper.toResponse);
    }
    const entities = await this.masterPCService.findAll();
    return entities.map(MasterPCMapper.toResponse);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const entity = await this.masterPCService.findOne(id);
    return MasterPCMapper.toResponse(entity);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMasterPCDto,
  ) {
    const entity = await this.masterPCService.update(id, dto);
    return MasterPCMapper.toResponse(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.masterPCService.remove(id);
  }
}
