import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterPC } from '../models/masterPC.entity';
import { CreateMasterPCDto, UpdateMasterPCDto } from '../dto/masterPC.dto';
import { MasterPCMapper } from '../mappers/masterPC.mapper';

@Injectable()
export class MasterPCService {
  private readonly logger = new Logger(MasterPCService.name);

  constructor(
    @InjectRepository(MasterPC)
    private readonly masterPCRepository: Repository<MasterPC>,
  ) {}

  async create(dto: CreateMasterPCDto): Promise<MasterPC> {
    this.logger.log(`Creating PC: ${dto.parliamentName} (pcCode: ${dto.pcCode})`);
    const entity = this.masterPCRepository.create(MasterPCMapper.toEntity(dto));
    const saved = await this.masterPCRepository.save(entity);
    this.logger.debug(`MasterPC saved with ID: ${saved.id}`);
    return saved;
  }

  async findAll(): Promise<MasterPC[]> {
    this.logger.log('Fetching all Parliamentary Constituencies');
    return this.masterPCRepository.find({ order: { parliamentName: 'ASC' } });
  }

  async findByState(stateCode: number): Promise<MasterPC[]> {
    this.logger.log(`Fetching PCs for stateCode: ${stateCode}`);
    return this.masterPCRepository.find({
      where: { stateCode, active: true },
      order: { parliamentName: 'ASC' },
    });
  }

  async findOne(id: number): Promise<MasterPC> {
    this.logger.log(`Fetching MasterPC by ID: ${id}`);
    const pc = await this.masterPCRepository.findOne({ where: { id } });
    if (!pc) {
      this.logger.warn(`MasterPC with ID ${id} not found`);
      throw new NotFoundException(`Parliamentary Constituency with id ${id} not found`);
    }
    return pc;
  }

  async update(id: number, dto: UpdateMasterPCDto): Promise<MasterPC> {
    this.logger.log(`Updating MasterPC ID: ${id}`);
    const existing = await this.findOne(id);
    const updated = this.masterPCRepository.merge(existing, dto);
    return this.masterPCRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting MasterPC ID: ${id}`);
    const existing = await this.findOne(id);
    await this.masterPCRepository.remove(existing);
    this.logger.debug(`MasterPC ID: ${id} deleted`);
  }
}
