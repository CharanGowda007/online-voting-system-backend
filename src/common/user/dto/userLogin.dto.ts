import { IsInt, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9@._-]+$/, { message: 'Invalid loginId format' })
  loginId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, {
    message: 'Invalid password format',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  captchaId: string;

  @IsString()
  @IsNotEmpty()
  captchaText: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  departmentName?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  ofcAddress?: string;

  @IsOptional()
  @IsInt()
  locationId?: number;

  @IsOptional()
  @IsString()
  postName?: string;

  @IsOptional()
  @IsString()
  aliasName?: string;
}

