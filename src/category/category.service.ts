import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Category, CategoryType } from "./schema/category.schema";
import { FilterQuery, Model, UpdateQuery } from "mongoose";
import { CategoryRequestEntity } from "./dto/category.request-entity";
import { UserService } from "src/user/user.service";
import { SurveyAssignmentService } from "src/survey/survey-assignment.service";
import { User } from "src/user/schema/user.schema";
import { SurveyService } from "src/survey/survey.service";
import { SurveyStatus } from "src/survey/schema/survey.schema";
import { SurveyAssignment } from "src/survey/schema/survey-assignment.schema";

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

    constructor(
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        @Inject() private readonly userService: UserService,
        @Inject() private readonly surveyAssignmentService: SurveyAssignmentService,
        @Inject() private readonly surveyService: SurveyService
    ) { }

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

    async deleteCategory(query: FilterQuery<Category>) {
        const category = await this.categoryModel.findOne(query);

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        const categoriesToDelete = await this.categoryModel.find({
            path: { $regex: new RegExp(`${category._id}`) }
        });

        const groupIdsToRemove = categoriesToDelete
            .filter(category => category.categoryType === CategoryType.GROUP)
            .map(category => category._id);

        if (category.categoryType === CategoryType.GROUP) {
            groupIdsToRemove.push(category._id)
        }

        if (groupIdsToRemove.length > 0) {
            const usersIds = (await this.userService.searchUsers({ groupId: { $in: groupIdsToRemove } }) as User[])
                .map(user => user._id);

            const assignedSurveys = await this.surveyAssignmentService.searchSurveyAssignments({ studentId: { $in: usersIds } }) as SurveyAssignment[]
            await this.surveyAssignmentService.deleteSurveyAssigns({ studentId: { $in: usersIds } });


            const surveyIdsToUpdate = assignedSurveys.map(assigns => assigns.survey._id)

            if (surveyIdsToUpdate.length > 0) {
                await this.surveyService.changeSurveysStatus({ _id: { $in: surveyIdsToUpdate } }, SurveyStatus.IN_PROGRESS);
            }

            await this.userService.updateUsers(
                { _id: { $in: usersIds } },
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

    async getGroupCategoriesTree() {
        const groupCategories = await this.categoryModel.find({
            categoryType: CategoryType.GROUP
        })


        const groupPaths = groupCategories.map(group => group.path);

        const ancestorIds = new Set<string>();
        groupPaths.forEach(path => {
            if (path) {
                const pathParts = path.split(this.defaultPathSeparator);
                pathParts.forEach(id => ancestorIds.add(id));
            }
        });
        groupCategories.forEach(group => ancestorIds.add(group._id));

        const allRelevantCategories = await this.categoryModel.find({
            _id: { $in: Array.from(ancestorIds) }
        });

        return allRelevantCategories;
    }

    async getCategories(query: FilterQuery<Category>) {
        return await this.categoryModel.find(query);
    }
}