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
}
