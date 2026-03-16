import { IsNotEmpty, IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateMasterStateDto {
  @IsNumber()
  @IsNotEmpty()
  stateCode: number;

  @IsNumber()
  @IsNotEmpty()
  countryCode: number;

  @IsString()
  @IsNotEmpty()
  stateName: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateMasterStateDto {
  @IsNumber()
  @IsOptional()
  stateCode?: number;

  @IsNumber()
  @IsOptional()
  countryCode?: number;

  @IsString()
  @IsOptional()
  stateName?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
