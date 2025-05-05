import { Body, Controller, Get, Inject, Param, Post, Put, Query } from "@nestjs/common";
import { SurveyAssignmentService } from "./survey-assignment.service";
import { SurveyAssignmentRequestEntity } from "./dto/survey-assign/survey-assignment.request-entity";
import { CategoriesSurveyAssignmentRequest } from "./dto/survey-assign/categories-survey-assignment.request";
import { plainToInstance } from "class-transformer";
import { AssignmentResponse } from "./dto/survey-assign/assignment.survey";
import { FilterQuery, Types } from "mongoose";
import { SurveyAssignment } from "./schema/survey-assignment.schema";
import { SurveyRequestEntity } from "./dto/survey/survey.request-entity";

@Controller('survey/assign')
export class SurveyAssignmentController {

    constructor(@Inject() private readonly surveyAssignmentService: SurveyAssignmentService) { }

    @Post()
    async addSurveyAssignment(@Body() surveyAssignment: SurveyAssignmentRequestEntity) {
        return await this.surveyAssignmentService.addSurveyAssignment(surveyAssignment);
    }

    @Post('categories')
    async categoriesAssignment(@Body() surveyAssignment: CategoriesSurveyAssignmentRequest) {
        console.log("Survey assignment: ", surveyAssignment)
        return await this.surveyAssignmentService.assignByCategories(surveyAssignment);
    }

    @Get('user/:id')
    async getAssignsByUser(@Param('id') id: string) {
        return plainToInstance(AssignmentResponse, await this.surveyAssignmentService.searchSurveyAssignments({ studentId: id }))
    }

    @Get('by-query')
    async getAssignBySurveyAndUser(@Query('surveyId') surveyId: string, @Query('userId') userId: string) {
        const query: FilterQuery<SurveyAssignment> = { studentId: userId };
        query['survey._id'] = surveyId;

        const assignment = await this.surveyAssignmentService.getSurveyAssignment(query);
        return plainToInstance(AssignmentResponse, assignment);
    }

    @Put()
    async completeSurveyAssignment(@Body() survey: SurveyRequestEntity) {
        
    }

}