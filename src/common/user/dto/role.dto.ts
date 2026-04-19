import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'CASE_WORKER', description: 'Role code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Caseworker', description: 'Role display name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}

export class UpdateRoleDto {
  @ApiProperty({
    example: 'Caseworker',
    description: 'Role display name',
    required: false,
  })
  @IsString()
  @MaxLength(50)
  name?: string;
}

