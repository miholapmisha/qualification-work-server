import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Category, CategorySchema } from "./schema/category.schema";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import { UserModule } from "src/user/user.module";

@Module({
    imports: [MongooseModule.forFeature([{name: Category.name, schema: CategorySchema}]), UserModule],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService]
})
export class CategoryModule {}