import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterAC } from '../models/masterAC.entity';
import { CreateMasterACDto, UpdateMasterACDto } from '../dto/masterAC.dto';
import { MasterACMapper } from '../mappers/masterAC.mapper';

@Injectable()
export class MasterACService {
  private readonly logger = new Logger(MasterACService.name);

  constructor(
    @InjectRepository(MasterAC)
    private readonly masterACRepository: Repository<MasterAC>,
  ) {}

  async create(dto: CreateMasterACDto): Promise<MasterAC> {
    this.logger.log(`Creating AC: ${dto.assemblyName} (assemblyCode: ${dto.assemblyCode})`);
    const entity = this.masterACRepository.create(MasterACMapper.toEntity(dto));
    const saved = await this.masterACRepository.save(entity);
    this.logger.debug(`MasterAC saved with ID: ${saved.id}`);
    return saved;
  }

  async findAll(): Promise<MasterAC[]> {
    this.logger.log('Fetching all Assembly Constituencies');
    return this.masterACRepository.find({ order: { assemblyName: 'ASC' } });
  }

  async findByParliament(parliamentCode: number): Promise<MasterAC[]> {
    this.logger.log(`Fetching ACs for parliamentCode: ${parliamentCode}`);
    return this.masterACRepository.find({
      where: { parliamentCode, active: true },
      order: { assemblyName: 'ASC' },
    });
  }

  async findOne(id: number): Promise<MasterAC> {
    this.logger.log(`Fetching MasterAC by ID: ${id}`);
    const ac = await this.masterACRepository.findOne({ where: { id } });
    if (!ac) {
      this.logger.warn(`MasterAC with ID ${id} not found`);
      throw new NotFoundException(`Assembly Constituency with id ${id} not found`);
    }
    return ac;
  }

  async update(id: number, dto: UpdateMasterACDto): Promise<MasterAC> {
    this.logger.log(`Updating MasterAC ID: ${id}`);
    const existing = await this.findOne(id);
    const updated = this.masterACRepository.merge(existing, dto);
    return this.masterACRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting MasterAC ID: ${id}`);
    const existing = await this.findOne(id);
    await this.masterACRepository.remove(existing);
    this.logger.debug(`MasterAC ID: ${id} deleted`);
  }
}
