import { IsNotEmpty, IsString, Matches } from 'class-validator';

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

