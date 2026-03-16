import { IsNotEmpty, IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateMasterACDto {
  @IsNumber()
  @IsNotEmpty()
  assemblyCode: number;

  @IsString()
  @IsNotEmpty()
  assemblyName: string;

  @IsNumber()
  @IsNotEmpty()
  parliamentCode: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateMasterACDto {
  @IsNumber()
  @IsOptional()
  assemblyCode?: number;

  @IsString()
  @IsOptional()
  assemblyName?: string;

  @IsNumber()
  @IsOptional()
  parliamentCode?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
