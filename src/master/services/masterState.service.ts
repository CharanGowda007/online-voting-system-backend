import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterState } from '../models/masterState.entity';
import { CreateMasterStateDto, UpdateMasterStateDto } from '../dto/masterState.dto';
import { MasterStateMapper } from '../mappers/masterState.mapper';

@Injectable()
export class MasterStateService {
  private readonly logger = new Logger(MasterStateService.name);

  constructor(
    @InjectRepository(MasterState)
    private readonly masterStateRepository: Repository<MasterState>,
  ) {}

  async create(dto: CreateMasterStateDto): Promise<MasterState> {
    this.logger.log(`Creating new MasterState: ${dto.stateName} (stateCode: ${dto.stateCode})`);
    const entity = this.masterStateRepository.create(MasterStateMapper.toEntity(dto));
    const saved = await this.masterStateRepository.save(entity);
    this.logger.debug(`MasterState saved with ID: ${saved.id}`);
    return saved;
  }

  async findAll(): Promise<MasterState[]> {
    this.logger.log('Fetching all MasterStates');
    return this.masterStateRepository.find({ order: { stateName: 'ASC' } });
  }

  async findByCountry(countryCode: number): Promise<MasterState[]> {
    this.logger.log(`Fetching MasterStates for countryCode: ${countryCode}`);
    return this.masterStateRepository.find({ where: { countryCode, active: true }, order: { stateName: 'ASC' } });
  }

  async findOne(id: number): Promise<MasterState> {
    this.logger.log(`Fetching MasterState by ID: ${id}`);
    const state = await this.masterStateRepository.findOne({ where: { id } });
    if (!state) {
      this.logger.warn(`MasterState with ID ${id} not found`);
      throw new NotFoundException(`State with id ${id} not found`);
    }
    return state;
  }

  async update(id: number, dto: UpdateMasterStateDto): Promise<MasterState> {
    this.logger.log(`Updating MasterState ID: ${id}`);
    const existing = await this.findOne(id);
    const updated = this.masterStateRepository.merge(existing, dto);
    return this.masterStateRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting MasterState ID: ${id}`);
    const existing = await this.findOne(id);
    await this.masterStateRepository.remove(existing);
    this.logger.debug(`MasterState ID: ${id} deleted`);
  }
}
