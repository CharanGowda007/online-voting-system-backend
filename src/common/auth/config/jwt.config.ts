import {registerAs}  from '@nestjs/config';

export default registerAs('jwt',()=>({
    secret:process.env.JWT_SECRET,
    signOptions:{
        issuer:process.env.JWT_ISSUER || 'online-voting-backend',
        expiresIn:process.env.JWT_EXPIRES_IN || '7d',
    },
}));
