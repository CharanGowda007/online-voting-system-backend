import {IsNotEmpty,IsString} from 'class-validator';
export class ValidateCaptchaDto{
    @IsString()
    @IsNotEmpty()
    readonly captchaId:string;
    @IsString()
    @IsNotEmpty()
    readonly captchaText:string;
}