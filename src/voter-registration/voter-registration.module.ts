import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoterRegistrationService } from './service/voter-registration.service';
import { VoterRegistrationController } from './controller/voter-registration.controller';
import { VoterRegistration } from './entity/voter-registration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VoterRegistration])],
  controllers: [VoterRegistrationController],
  providers: [VoterRegistrationService],
})
export class VoterRegistrationModule {}
