import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserStatus } from '../enums/userStatus.enum';
import { UserType } from '../enums/userTypes.enum';

export class CreateUserDto {
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  loginId: string;   

  @IsString()
  @IsNotEmpty()
  password: string;  

  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: UserStatus;  

  @IsBoolean()
  @IsNotEmpty()
  resetRequired: boolean;  

  @IsEnum(UserType)
  @IsNotEmpty()
  userType: UserType;  
}