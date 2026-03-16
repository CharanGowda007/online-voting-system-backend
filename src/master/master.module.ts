import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterCountry } from './models/masterCountry.entity';
import { MasterCountryService } from './services/masterCountry.service';
import { MasterCountryController } from './controllers/masterCountry.controller';
import { MasterState } from './models/masterState.entity';
import { MasterStateService } from './services/masterState.service';
import { MasterStateController } from './controllers/masterState.controller';
import { MasterPC } from './models/masterPC.entity';
import { MasterPCService } from './services/masterPC.service';
import { MasterPCController } from './controllers/masterPC.controller';
import { MasterAC } from './models/masterAC.entity';
import { MasterACService } from './services/masterAC.service';
import { MasterACController } from './controllers/masterAC.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MasterCountry, MasterState, MasterPC, MasterAC])],
  controllers: [MasterCountryController, MasterStateController, MasterPCController, MasterACController],
  providers: [MasterCountryService, MasterStateService, MasterPCService, MasterACService],
  exports: [MasterCountryService, MasterStateService, MasterPCService, MasterACService],
})
export class MasterModule {}
