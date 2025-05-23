import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
import { PageOptionsDto } from "src/pagination/dto/page-options.dto";
import { PaginationService } from "src/pagination/pagination.service";
import { SurveyAssignment } from "./schema/survey-assignment.schema";
import { SurveyAssignmentRequestEntity } from "./dto/survey-assign/survey-assignment.request-entity";
import { UserService } from "src/user/user.service";
import { CategoriesSurveyAssignmentRequestEntity } from "./dto/survey-assign/categories-survey-assignment.request-entity";
import { SurveyService } from "./survey.service";
import { SurveyStatus } from "./schema/survey.schema";
import { CategoryService } from "src/category/category.service";
import { CategoryType } from "src/category/schema/category.schema";
import { AnswersEntity } from "./dto/survey-assign/answers.request-entity";
import { User } from "src/user/schema/user.schema";

@Injectable()
export class SurveyAssignmentService {

    constructor(
        @InjectModel(SurveyAssignment.name) private readonly surveyAssignmentModel: Model<SurveyAssignment>,
        @Inject() private readonly paginationService: PaginationService,
        @Inject() private readonly userService: UserService,
        @Inject() private readonly surveyService: SurveyService,
        @Inject(forwardRef(() => CategoryService)) private readonly categoryService: CategoryService
    ) { }

    async addSurveyAssignment(surveyAssignment: SurveyAssignmentRequestEntity): Promise<SurveyAssignment> {
        return await new this.surveyAssignmentModel(surveyAssignment).save();
    }

    async searchSurveyAssignments(query: FilterQuery<SurveyAssignment>, pageOptionsDto?: PageOptionsDto) {
        if (pageOptionsDto) {
            return this.paginationService.paginate(this.surveyAssignmentModel, query, pageOptionsDto);
        } else {
            return this.surveyAssignmentModel.find(query);
        }
    }

    async getSurveyAssignment(query: FilterQuery<SurveyAssignment>) {
        const assignment = await this.surveyAssignmentModel.findOne(query)

        if (!assignment) {
            throw new NotFoundException("Assignment not found")
        }

        return assignment
    }

    async assignByCategories(surveyAssignment: CategoriesSurveyAssignmentRequestEntity): Promise<SurveyAssignment[]> {

        const groupCategories = await this.categoryService.getCategories({
            $and: [
                {
                    _id: { $in: surveyAssignment.assignCategoriesIds }
                },
                {
                    categoryType: CategoryType.GROUP
                }
            ]
        })

        return await this.assignToUsersByGroup(surveyAssignment, groupCategories.map(category => category._id))
    }

    async getCategoriesByAssignment(surveyId: string) {

        const surveyAssignments = await this.surveyAssignmentModel.find({ "survey._id": surveyId });
        if (!surveyAssignments || surveyAssignments.length === 0) {
            throw new NotFoundException("No survey assignments found for the given survey ID");
        }

        const studentIds = surveyAssignments.map((assignment) => assignment.studentId);
        const users = (await this.userService.searchUsers({ _id: { $in: studentIds } })) as User[];
        const groupIds = users.map((user) => user.groupId).filter((groupId) => groupId);

        if (groupIds.length === 0) {
            throw new NotFoundException("No groups found for the assigned students");
        }

        return await this.categoryService.getCategoriesTreeByChilds({
            _id: { $in: groupIds }
        });
    }

    async deleteSurveyAssigns(query: FilterQuery<SurveyAssignment>) {
        return await this.surveyAssignmentModel.deleteMany(query)
    }

    async completeSurvey(surveyId: string, userId: string, answers: AnswersEntity) {
        const query = { studentId: userId }
        query['survey._id'] = surveyId
        const assign = await this.surveyAssignmentModel.findOne(query)

        if (assign?.answers) {
            console.log("Assign answers: ", assign.answers)
            throw new BadRequestException("Survey already completed")
        }

        return await this.surveyAssignmentModel.findOneAndUpdate(query, { $set: answers })
    }

    private async assignToUsersByGroup(surveyAssignment: CategoriesSurveyAssignmentRequestEntity, groupIds: string[]) {
        const surveyAssignments: SurveyAssignment[] = [];
        const users = await this.userService.searchUsers({ groupId: { $in: groupIds } })
        const userIds = Array.isArray(users) ? users.map(user => user._id) : [];

        if (userIds.length === 0) {
            throw new BadRequestException('No users found under selected groups')
        }

        for (const userId of userIds) {
            const surveyAssignmentData: SurveyAssignment = {
                survey: surveyAssignment.survey,
                studentId: userId
            };
            surveyAssignments.push(surveyAssignmentData);
        }

        await this.surveyService.changeSurveysStatus({ _id: surveyAssignment.survey._id }, SurveyStatus.PUBLISHED)
        return await this.surveyAssignmentModel.insertMany(surveyAssignments)
    }
}