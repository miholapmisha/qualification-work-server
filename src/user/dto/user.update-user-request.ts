import { IsEmail, IsNotEmpty, IsOptional, IsArray, IsEnum, IsStrongPassword, ValidateIf } from 'class-validator';
import { UserRole } from '../schema/user.schema';

export class UpdateUserRequest {
    @IsOptional()
    @IsEmail()
    email?: string;

    @ValidateIf((object, value) => value !== undefined)
    @IsStrongPassword()
    password?: string;

    @IsOptional()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsArray()
    @IsEnum(UserRole, { each: true })
    roles?: UserRole[];
}