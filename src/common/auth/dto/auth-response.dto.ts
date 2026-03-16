export class AuthResponseDto {
    access_token:string;
    user:{
        id:string;
        name:string;
        mobile:string;
    }
}