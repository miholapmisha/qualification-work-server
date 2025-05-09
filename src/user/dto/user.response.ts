import { Exclude, Expose, Type } from "class-transformer";
import { UserRole } from "../schema/user.schema";
import { CategoryResponse } from "src/category/dto/category.response";

@Exclude()
export class UserResponse {
    @Expose()
    _id: string;

    @Expose()
    email: string;

    @Expose()
    name: string;

    @Expose()
    roles: UserRole[];

    @Expose()
    @Type(() => CategoryResponse)
    group: CategoryResponse;
}