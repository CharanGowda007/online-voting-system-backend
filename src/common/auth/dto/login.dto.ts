import {IsEmail,IsNotEmpty,IsString} from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    @IsString()
    mobile:string;

    @IsNotEmpty()
    @IsString()
    password:string;

}