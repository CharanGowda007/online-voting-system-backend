import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches, Length, IsNumber, IsEnum } from 'class-validator';
import { Gender } from '../enums/voter.enums';

export class CreateVoterRegistrationDto {
  @IsString()
  @IsNotEmpty()
  applicantName: string;

  @IsString()
  @IsNotEmpty()
  relativeName: string;

  @IsString()
  @IsNotEmpty()
  dateOfBirth: string; // expecting YYYY-MM-DD format

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, { message: 'Mobile must be a 10 digit number' })
  mobile: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(12, 12, { message: 'Aadhaar must be exactly 12 digits' })
  aadhaarNumber?: string;

  @IsString()
  @IsNotEmpty()
  streetAddress: string;

  @IsString()
  @IsNotEmpty()
  villageTown: string;

  @IsString()
  @IsNotEmpty()
  postOffice: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'PIN code must be exactly 6 digits' })
  pincode: string;

  @IsString()
  @IsNotEmpty()
  tehsil: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsNumber()
  @IsNotEmpty()
  stateCode: number;

  @IsString()
  @IsNotEmpty()
  placeOfBirth: string;

  @IsNumber()
  @IsNotEmpty()
  pcCode: number;

  @IsNumber()
  @IsNotEmpty()
  acCode: number;
}
