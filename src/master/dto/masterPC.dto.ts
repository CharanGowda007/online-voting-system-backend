import { IsNotEmpty, IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateMasterPCDto {
  @IsNumber()
  @IsNotEmpty()
  pcCode: number;

  @IsString()
  @IsNotEmpty()
  parliamentName: string;

  @IsNumber()
  @IsNotEmpty()
  stateCode: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateMasterPCDto {
  @IsNumber()
  @IsOptional()
  pcCode?: number;

  @IsString()
  @IsOptional()
  parliamentName?: string;

  @IsNumber()
  @IsOptional()
  stateCode?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
