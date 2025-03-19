import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CategoryType } from "../schema/category.schema";

export class CategoryRequestEntity {

    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    path: string;

    @IsEnum(CategoryType)
    categoryType: CategoryType;

}