import { MasterCountry } from '../models/masterCountry.entity';
import { CreateMasterCountryDto } from '../dto/masterCountry.dto';

export class MasterCountryMapper {
  static toEntity(dto: CreateMasterCountryDto): Partial<MasterCountry> {
    return {
      countryCode: dto.countryCode,
      countryName: dto.countryName,
      active: dto.active ?? true,
    };
  }

  static toResponse(entity: MasterCountry) {
    return {
      id: entity.id,
      countryCode: entity.countryCode,
      countryName: entity.countryName,
      active: entity.active,
    };
  }
}
