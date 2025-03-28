import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsStrongPassword } from "class-validator";
import { UserRole } from "../schema/user.schema";

export class CreateUserRequest {
    @IsEmail()
    email: string;

    @IsStrongPassword()
    password: string;

    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsArray()
    @IsEnum(UserRole, { each: true })
    roles?: UserRole[];
}