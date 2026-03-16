import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoterRegistration } from '../entity/voter-registration.entity';
import { CreateVoterRegistrationDto } from '../dto/create-voter-registration.dto';

@Injectable()
export class VoterRegistrationService {
  private readonly logger = new Logger(VoterRegistrationService.name);

  constructor(
    @InjectRepository(VoterRegistration)
    private readonly voterRegistrationRepository: Repository<VoterRegistration>,
  ) {}

  async create(createDto: CreateVoterRegistrationDto): Promise<VoterRegistration> {
    this.logger.log(`Creating new Voter Registration (Form 6) for: ${createDto.applicantName}`);
    
    const newRegistration = this.voterRegistrationRepository.create(createDto as unknown as Partial<VoterRegistration>);
    const savedRegistration = await this.voterRegistrationRepository.save(newRegistration);
    
    this.logger.debug(`Successfully saved Voter Registration with Database ID: ${savedRegistration.id}`);
    return savedRegistration;
  }

  async getStats(filters?: { stateCode?: number; pcCode?: number; acCode?: number }): Promise<{ total: number; byGender: { gender: string; count: number }[] }> {
    this.logger.log(`Fetching voter registration statistics with filters: ${JSON.stringify(filters)}`);
    const qb = this.voterRegistrationRepository
      .createQueryBuilder('vr')
      .select('vr.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .groupBy('vr.gender');

    if (filters?.stateCode) {
      qb.andWhere('vr.state_code = :stateCode', { stateCode: filters.stateCode });
    }
    if (filters?.pcCode) {
      qb.andWhere('vr.pc_code = :pcCode', { pcCode: filters.pcCode });
    }
    if (filters?.acCode) {
      qb.andWhere('vr.ac_code = :acCode', { acCode: filters.acCode });
    }

    const results = await qb.getRawMany();
    const byGender = results.map(r => ({ gender: r.gender, count: Number(r.count) }));
    const total = byGender.reduce((sum, r) => sum + r.count, 0);
    this.logger.debug(`Voter stats: total=${total}`);
    return { total, byGender };
  }
}
