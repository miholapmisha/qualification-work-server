import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from "@nestjs/common";
import { CategoryRequestEntity } from "./dto/category.request-entity";
import { CategoryService } from "./category.service";
import { plainToInstance } from "class-transformer";
import { CategoryResponse } from "./dto/category.response";

@Controller('category')
export class CategoryController {

    constructor(@Inject() private readonly categoryService: CategoryService) { }

    @Post()
    async addCategory(@Body() categories: CategoryRequestEntity[]) {
        return (await this.categoryService.addCategories(categories))
            .map((category) => plainToInstance(CategoryResponse, category))
    }

    @Get()
    async getCategories(@Query() params: any) {
        return await this.categoryService.getCategoriesByFilter(params)
    }

    @Delete()
    async deleteCategory(@Query() params: any) {
        await this.categoryService.deteleteCategory(params)
    }

    @Put(':id')
    async updateCategory(@Param('id') _id, @Body() category: CategoryRequestEntity) {
        return plainToInstance(CategoryResponse, await this.categoryService.updateCategory({ _id }, { $set: category }))
    }

}