import { MasterState } from '../models/masterState.entity';
import { CreateMasterStateDto } from '../dto/masterState.dto';

export class MasterStateMapper {
  /**
   * Maps a CreateMasterStateDto to a partial MasterState entity for persistence.
   */
  static toEntity(dto: CreateMasterStateDto): Partial<MasterState> {
    return {
      stateCode: dto.stateCode,
      countryCode: dto.countryCode,
      stateName: dto.stateName,
      active: dto.active ?? true,
    };
  }

  /**
   * Maps a MasterState entity to a safe response object (no internal IDs exposed unless needed).
   */
  static toResponse(entity: MasterState) {
    return {
      id: entity.id,
      stateCode: entity.stateCode,
      countryCode: entity.countryCode,
      stateName: entity.stateName,
      active: entity.active,
    };
  }
}
