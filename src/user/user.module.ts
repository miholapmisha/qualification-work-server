import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schema/user.schema";
import { UserService } from "./user.service";
import { ValidationUserCredentialsInterceptor } from "./interceptors/validation-user-credentials.interceptor";
import { PaginationModule } from "src/pagination/pagination.module";
import { FilteringModule } from "src/filtering/filtering.module";

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), PaginationModule, FilteringModule],
    controllers: [UserController],
    providers: [UserService, ValidationUserCredentialsInterceptor],
    exports: [UserService]
})
export class UserModule { }