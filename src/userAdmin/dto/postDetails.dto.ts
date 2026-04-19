import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePostDetailsDto {
  @ApiProperty({ example: 'Case-Worker' })
  @IsString()
  @IsNotEmpty()
  postName: string;

  @ApiProperty({ example: 'CAS Department' })
  @IsString()
  @IsNotEmpty()
  departmentName: string;

  @ApiProperty({ example: 1, description: 'Role id from role table' })
  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty({ example: 'Caseworker' })
  @IsString()
  @IsNotEmpty()
  roleName: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  locationId: number;

  @ApiProperty({ example: 'Bangalore Office' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: '123 Main St, Bangalore' })
  @IsString()
  @IsNotEmpty()
  ofcAddress: string;

  @ApiProperty({ example: 'office@example.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '08012345678' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'case-worker', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  postId?: string;

  @ApiProperty({ example: 'alias_post_1', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  aliasName?: string;
}

export class UpdatePostDetailsDto extends PartialType(CreatePostDetailsDto) {}
export class PostDetailsQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 10;
}