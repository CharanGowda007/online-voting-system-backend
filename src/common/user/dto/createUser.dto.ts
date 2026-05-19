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
  @IsOptional()
  resetRequired?: boolean;  

  @IsEnum(UserType)
  @IsNotEmpty()
  userType: UserType;

  // Profile Fields (Optional for User entity creation, processed by UserService)
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  departmentName?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  ofcAddress?: string;
}