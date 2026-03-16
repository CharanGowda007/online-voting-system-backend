import { IsNotEmpty, IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateMasterCountryDto {
  @IsNumber()
  @IsNotEmpty()
  countryCode: number;

  @IsString()
  @IsNotEmpty()
  countryName: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateMasterCountryDto {
  @IsNumber()
  @IsOptional()
  countryCode?: number;

  @IsString()
  @IsOptional()
  countryName?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
