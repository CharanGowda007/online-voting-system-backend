import { MasterPC } from '../models/masterPC.entity';
import { CreateMasterPCDto } from '../dto/masterPC.dto';

export class MasterPCMapper {
  static toEntity(dto: CreateMasterPCDto): Partial<MasterPC> {
    return {
      pcCode: dto.pcCode,
      parliamentName: dto.parliamentName,
      stateCode: dto.stateCode,
      active: dto.active ?? true,
    };
  }

  static toResponse(entity: MasterPC) {
    return {
      id: entity.id,
      pcCode: entity.pcCode,
      parliamentName: entity.parliamentName,
      stateCode: entity.stateCode,
      active: entity.active,
    };
  }
}
