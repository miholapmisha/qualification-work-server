import { Expose } from "class-transformer";
import { CategoryType } from "../schema/category.schema"

@Expose()
export class CategoryResponse {

    _id: string;

    categoryType: CategoryType;

    name: string;
}