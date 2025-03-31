import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schema/user.schema";
import { UserService } from "./user.service";
import { ValidationUserCredentialsInterceptor } from "./interceptors/validation-user-credentials.interceptor";

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [UserController],
    providers: [UserService, ValidationUserCredentialsInterceptor],
    exports: [UserService]
})
export class UserModule { }