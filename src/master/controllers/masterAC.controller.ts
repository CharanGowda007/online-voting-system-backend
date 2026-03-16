import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { MasterACService } from '../services/masterAC.service';
import { CreateMasterACDto, UpdateMasterACDto } from '../dto/masterAC.dto';
import { MasterACMapper } from '../mappers/masterAC.mapper';

@Controller('master/ac')
export class MasterACController {
  constructor(private readonly masterACService: MasterACService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMasterACDto) {
    const entity = await this.masterACService.create(dto);
    return MasterACMapper.toResponse(entity);
  }

  @Get()
  async findAll(@Query('parliamentCode') parliamentCode?: string) {
    if (parliamentCode) {
      const entities = await this.masterACService.findByParliament(Number(parliamentCode));
      return entities.map(MasterACMapper.toResponse);
    }
    const entities = await this.masterACService.findAll();
    return entities.map(MasterACMapper.toResponse);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const entity = await this.masterACService.findOne(id);
    return MasterACMapper.toResponse(entity);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMasterACDto,
  ) {
    const entity = await this.masterACService.update(id, dto);
    return MasterACMapper.toResponse(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.masterACService.remove(id);
  }
}
