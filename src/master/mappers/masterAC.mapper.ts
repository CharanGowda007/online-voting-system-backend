import { MasterAC } from '../models/masterAC.entity';
import { CreateMasterACDto } from '../dto/masterAC.dto';

export class MasterACMapper {
  static toEntity(dto: CreateMasterACDto): Partial<MasterAC> {
    return {
      assemblyCode: dto.assemblyCode,
      assemblyName: dto.assemblyName,
      parliamentCode: dto.parliamentCode,
      active: dto.active ?? true,
    };
  }

  static toResponse(entity: MasterAC) {
    return {
      id: entity.id,
      assemblyCode: entity.assemblyCode,
      assemblyName: entity.assemblyName,
      parliamentCode: entity.parliamentCode,
      active: entity.active,
    };
  }
}
