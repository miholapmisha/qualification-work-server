import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";
import { UserRole } from "../schema/user.schema";

export class CreateUserRequest {
    @IsEmail()
    email: string;

    @IsStrongPassword()
    password: string;

    @IsNotEmpty()
    name: string;

    roles: undefined | UserRole[];
}