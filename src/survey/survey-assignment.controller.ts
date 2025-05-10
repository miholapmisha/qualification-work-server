import { Body, Controller, Get, Inject, Param, Post, Query, UseGuards } from "@nestjs/common";
import { SurveyAssignmentService } from "./survey-assignment.service";
import { SurveyAssignmentRequestEntity } from "./dto/survey-assign/survey-assignment.request-entity";
import { CategoriesSurveyAssignmentRequestEntity } from "./dto/survey-assign/categories-survey-assignment.request-entity";
import { plainToInstance } from "class-transformer";
import { AssignmentResponse } from "./dto/survey-assign/assignment.survey";
import { FilterQuery } from "mongoose";
import { SurveyAssignment } from "./schema/survey-assignment.schema";
import { AnswersEntity } from "./dto/survey-assign/answers.request-entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guars";
import { PageOptionsDto } from "src/pagination/dto/page-options.dto";
import { FilteringService } from "src/filtering/filtering.service";

@Controller('survey/assign')
// @UseGuards(JwtAuthGuard)
export class SurveyAssignmentController {

    constructor(
        @Inject() private readonly surveyAssignmentService: SurveyAssignmentService,
        @Inject() private readonly filteringService: FilteringService) { }

    @Post()
    async addSurveyAssignment(@Body() surveyAssignment: SurveyAssignmentRequestEntity) {
        return await this.surveyAssignmentService.addSurveyAssignment(surveyAssignment);
    }

    @Post('categories')
    async categoriesAssignment(@Body() surveyAssignment: CategoriesSurveyAssignmentRequestEntity) {
        return await this.surveyAssignmentService.assignByCategories(surveyAssignment);
    }

    @Post('search')
    async searchSurveys(@Body() searchParams, @Query() pageParams: PageOptionsDto) {

        return await this.filteringService.search(
            searchParams,
            pageParams,
            this.surveyAssignmentService.searchSurveyAssignments.bind(this.surveyAssignmentService),
            AssignmentResponse
        )
    }

    @Get('categories/:id')
    async getCategoriesOfSurveyAssignment(@Param('id') surveyId: string) {
        return await this.surveyAssignmentService.getCategoriesByAssignment(surveyId)
    }

    @Get('by-query')
    async getAssignBySurveyAndUser(@Query('surveyId') surveyId: string, @Query('userId') userId: string) {
        const query: FilterQuery<SurveyAssignment> = { studentId: userId };
        query['survey._id'] = surveyId;

        const assignment = await this.surveyAssignmentService.getSurveyAssignment(query);
        return plainToInstance(AssignmentResponse, assignment);
    }

    @Post('complete')
    async completeSurveyAssignment(
        @Query('surveyId') surveyId: string,
        @Query('userId') userId: string,
        @Body() answers: AnswersEntity
    ) {
        return plainToInstance(AssignmentResponse, await this.surveyAssignmentService.completeSurvey(surveyId, userId, answers))
    }

}