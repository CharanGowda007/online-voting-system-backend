import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";
import { UserService } from "./service/user.service";
import { UserController } from "./controller/user.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(() => AuthModule)
    ],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService]
})
export class UserModule { }


