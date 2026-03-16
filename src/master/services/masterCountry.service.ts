import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterCountry } from '../models/masterCountry.entity';
import { CreateMasterCountryDto, UpdateMasterCountryDto } from '../dto/masterCountry.dto';
import { MasterCountryMapper } from '../mappers/masterCountry.mapper';

@Injectable()
export class MasterCountryService {
  private readonly logger = new Logger(MasterCountryService.name);

  constructor(
    @InjectRepository(MasterCountry)
    private readonly masterCountryRepository: Repository<MasterCountry>,
  ) {}

  async create(dto: CreateMasterCountryDto): Promise<MasterCountry> {
    this.logger.log(`Creating Country: ${dto.countryName} (countryCode: ${dto.countryCode})`);
    const entity = this.masterCountryRepository.create(MasterCountryMapper.toEntity(dto));
    const saved = await this.masterCountryRepository.save(entity);
    this.logger.debug(`MasterCountry saved with ID: ${saved.id}`);
    return saved;
  }

  async findAll(): Promise<MasterCountry[]> {
    this.logger.log('Fetching all Countries');
    return this.masterCountryRepository.find({ order: { countryName: 'ASC' } });
  }

  async findOne(id: number): Promise<MasterCountry> {
    this.logger.log(`Fetching MasterCountry by ID: ${id}`);
    const country = await this.masterCountryRepository.findOne({ where: { id } });
    if (!country) {
      this.logger.warn(`MasterCountry with ID ${id} not found`);
      throw new NotFoundException(`Country with id ${id} not found`);
    }
    return country;
  }

  async update(id: number, dto: UpdateMasterCountryDto): Promise<MasterCountry> {
    this.logger.log(`Updating MasterCountry ID: ${id}`);
    const existing = await this.findOne(id);
    const updated = this.masterCountryRepository.merge(existing, dto);
    return this.masterCountryRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting MasterCountry ID: ${id}`);
    const existing = await this.findOne(id);
    await this.masterCountryRepository.remove(existing);
    this.logger.debug(`MasterCountry ID: ${id} deleted`);
  }
}
