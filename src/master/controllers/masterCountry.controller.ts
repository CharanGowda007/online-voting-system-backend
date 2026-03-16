import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { MasterCountryService } from '../services/masterCountry.service';
import { CreateMasterCountryDto, UpdateMasterCountryDto } from '../dto/masterCountry.dto';
import { MasterCountryMapper } from '../mappers/masterCountry.mapper';

@Controller('master/country')
export class MasterCountryController {
  constructor(private readonly masterCountryService: MasterCountryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMasterCountryDto) {
    const entity = await this.masterCountryService.create(dto);
    return MasterCountryMapper.toResponse(entity);
  }

  @Get()
  async findAll() {
    const entities = await this.masterCountryService.findAll();
    return entities.map(MasterCountryMapper.toResponse);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const entity = await this.masterCountryService.findOne(id);
    return MasterCountryMapper.toResponse(entity);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMasterCountryDto,
  ) {
    const entity = await this.masterCountryService.update(id, dto);
    return MasterCountryMapper.toResponse(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.masterCountryService.remove(id);
  }
}
