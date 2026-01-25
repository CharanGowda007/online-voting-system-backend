import { IsEmail,IsNotEmpty,IsString} from "class-validator";

export class ForgetPasswordDto {
    @IsString()
    @IsNotEmpty()
    loginId:string;

    @IsEmail()
    @IsNotEmpty()
    email:string;
}