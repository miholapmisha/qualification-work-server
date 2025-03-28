import { Exclude, Expose } from "class-transformer";
import { UserRole } from "../schema/user.schema";

@Exclude()
export class UserResponse {
    @Expose()
    _id: string;
    
    @Expose()
    email: string;
    
    password: string;

    @Expose()
    name: string;

    @Expose()
    roles: UserRole[];

    refreshToken: string;
}