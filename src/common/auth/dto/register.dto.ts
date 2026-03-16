import {IsEmail,IsNotEmpty,IsString} from "class-validator";

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    mobile:string;

    @IsNotEmpty()
    @IsString()
    password:string;

    // @IsNotEmpty()
    // @IsString()
    // role:string;
}
