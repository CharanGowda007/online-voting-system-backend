import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsEmail } from 'class-validator';

export class RegisterUserByMobileDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiProperty({ example: '9876543210', required: true })
  @IsString()
  @MaxLength(20)
  mobileNumber: string;

  @ApiProperty({ example: 'Bangalore', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  districtName?: string;

  @ApiProperty({ example: 'Taluka Name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  talukaName?: string;

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
}
