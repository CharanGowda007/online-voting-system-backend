import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { MasterStateService } from '../services/masterState.service';
import { CreateMasterStateDto, UpdateMasterStateDto } from '../dto/masterState.dto';
import { MasterStateMapper } from '../mappers/masterState.mapper';

@Controller('master/state')
export class MasterStateController {
  constructor(private readonly masterStateService: MasterStateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMasterStateDto) {
    const entity = await this.masterStateService.create(dto);
    return MasterStateMapper.toResponse(entity);
  }

  @Get()
  async findAll(@Query('countryCode') countryCode?: string) {
    if (countryCode) {
      const entities = await this.masterStateService.findByCountry(Number(countryCode));
      return entities.map(MasterStateMapper.toResponse);
    }
    const entities = await this.masterStateService.findAll();
    return entities.map(MasterStateMapper.toResponse);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const entity = await this.masterStateService.findOne(id);
    return MasterStateMapper.toResponse(entity);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMasterStateDto,
  ) {
    const entity = await this.masterStateService.update(id, dto);
    return MasterStateMapper.toResponse(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.masterStateService.remove(id);
  }
}
