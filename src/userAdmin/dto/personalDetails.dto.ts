import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePersonalDetailsDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @ApiProperty({ example: '9876543210', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobileNumber?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  districtId?: number;

  @ApiProperty({ example: 'Bangalore', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  districtName?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  talukaId?: number;

  @ApiProperty({ example: 'Taluka Name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  talukaName?: string;

  @ApiProperty({
    example: 'CAS000001',
    description:
      'Optional. When omitted, auto-generated from series (e.g. CAS000001). Used as loginId in users table.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  personUniqueId?: string;

  @ApiProperty({ example: 'Dept Name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @ApiProperty({ example: 'Male', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  gender?: string;

  @ApiProperty({ example: 'Karnataka', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiProperty({ example: 'active', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  status?: string;
}

export class PersonalDetailsQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    description:
      'Filter by user type (e.g. superintendent). Returns only persons linked to a user with this role (users.loginId = person.personUniqueId).',
    example: 'superintendent',
  })
  @IsOptional()
  @IsString()
  userType?: string;

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