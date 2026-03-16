import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { VoterRegistrationService } from '../service/voter-registration.service';
import { CreateVoterRegistrationDto } from '../dto/create-voter-registration.dto';

@Controller('voter-registration')
export class VoterRegistrationController {
  constructor(private readonly voterRegistrationService: VoterRegistrationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createVoterRegistration(@Body() createDto: CreateVoterRegistrationDto) {
    return await this.voterRegistrationService.create(createDto);
  }
}
