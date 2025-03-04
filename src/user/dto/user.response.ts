import { Exclude, Expose } from "class-transformer";
import { UserRole } from "../schema/user.schema";

export class UserResponse {
    @Expose()
    id: string;
    
    @Expose()
    email: string;
    
    password: string;

    @Expose()
    name: string;

    @Expose()
    roles: UserRole[];
}