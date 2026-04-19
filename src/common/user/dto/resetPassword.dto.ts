import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class AutoResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}

