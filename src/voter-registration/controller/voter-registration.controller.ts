import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
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

  @Get('stats')
  async getStats(
    @Query('stateCode') stateCode?: string,
    @Query('pcCode') pcCode?: string,
    @Query('acCode') acCode?: string,
  ) {
    return await this.voterRegistrationService.getStats({
      stateCode: stateCode ? Number(stateCode) : undefined,
      pcCode: pcCode ? Number(pcCode) : undefined,
      acCode: acCode ? Number(acCode) : undefined,
    });
  }
}
