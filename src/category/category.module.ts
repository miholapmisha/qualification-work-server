import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Category, CategorySchema } from "./schema/category.schema";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import { UserModule } from "src/user/user.module";
import { SurveyModule } from "src/survey/survey.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
        UserModule,
        SurveyModule
    ],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService]
})
export class CategoryModule { }