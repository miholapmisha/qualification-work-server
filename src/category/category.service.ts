import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Category, CategoryType } from "./schema/category.schema";
import { FilterQuery, Model, UpdateQuery } from "mongoose";
import { CategoryRequestEntity } from "./dto/category.request-entity";
import { UserService } from "src/user/user.service";

@Injectable()
export class CategoryService {

    public defaultPathSeparator: string = '.';
    public defaultRootPath: string = ''

    private validCategoriesHierarchy: Record<CategoryType, CategoryType | null> = {
        [CategoryType.FACULTY]: CategoryType.SPECIALTY,
        [CategoryType.SPECIALTY]: CategoryType.DEGREE,
        [CategoryType.DEGREE]: CategoryType.YEAR,
        [CategoryType.YEAR]: CategoryType.GROUP,
        [CategoryType.GROUP]: null
    };

    constructor(@InjectModel(Category.name) private readonly categoryModel: Model<Category>, private readonly userService: UserService) { }

    async addCategories(data: CategoryRequestEntity[]): Promise<Category[]> {

        const session = await this.categoryModel.db.startSession();
        let results: Category[] = [];

        try {
            await session.startTransaction();

            for (const category of data) {
                if (category.categoryType === CategoryType.FACULTY) {
                    if (category.path !== this.defaultRootPath) {
                        throw new BadRequestException('Faculty should be placed under the root path');
                    }

                    const result = await this.categoryModel.create([category], { session });
                    results.push(result[0].toObject());
                } else {
                    const pathArray = category.path.split(this.defaultPathSeparator);
                    const parentId = pathArray[pathArray.length - 1];

                    const parentCategory = await this.categoryModel.findById(
                        { _id: parentId }
                    ).session(session);

                    if (!parentCategory) {
                        throw new BadRequestException('Parent not found under that path');
                    }

                    if (this.validCategoriesHierarchy[parentCategory?.categoryType] !== category.categoryType) {
                        const allowedCategory = Object.keys(this.validCategoriesHierarchy)
                            .find(key => this.validCategoriesHierarchy[key] === category.categoryType);

                        throw new BadRequestException(`Category ${category.categoryType.toString()} should be placed under ${allowedCategory} instead of ${parentCategory?.categoryType.toString()}`);
                    }

                    const result = await this.categoryModel.create([category], { session });
                    results.push(result[0].toObject());
                }
            }

            await session.commitTransaction();
            return results;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async deteleteCategory(query: FilterQuery<Category>) {

        const category = await this.categoryModel.findOne(query);

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        const categoriesToDelete = await this.categoryModel.find({
            path: { $regex: new RegExp(`${category._id}`) }
        });
        const groupIdsToRemove = categoriesToDelete
            .filter(cat => cat.categoryType === CategoryType.GROUP)
            .map(cat => cat._id);

        if (groupIdsToRemove.length > 0) {
            await this.userService.updateUsers(
                { groupId: { $in: groupIdsToRemove } },
                { $unset: { groupId: '' } }
            );
        }

        await this.categoryModel.deleteMany({ path: { $regex: new RegExp(`${category._id}`) } });

        return this.categoryModel.deleteOne(query);
    }

    async updateCategory(query: FilterQuery<Category>, data: UpdateQuery<Category>) {
        const updatedCategory = await this.categoryModel
            .findOneAndUpdate(query, data, {
                new: true,
                lean: true
            });

        if (!updatedCategory) {
            throw new NotFoundException("Category not found");
        }

        return updatedCategory;
    }

    async getCategoriesByParentId(query: FilterQuery<Category>) {
        const parentId = query.parentId

        if (parentId) {
            delete query.parentId
            const [parent, children] = await Promise.all([
                this.categoryModel.findById(parentId),
                this.categoryModel.find({
                    ...query,
                    path: {
                        $regex: new RegExp(parentId)
                    }
                })
            ])

            return [parent, ...children]
        }

        return await this.categoryModel.find(query)
    }
}