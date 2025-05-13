import { Body, Controller, Get, Inject, Param, Post, Query } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { SurveyAssignmentService } from "src/survey/survey-assignment.service";
import { SurveyService } from "src/survey/survey.service";

@Controller('analytics')
export class AnalyticsController {

    constructor(
        @Inject() private readonly analyticsService: AnalyticsService,
        @Inject() private readonly surveyAssignmentService: SurveyAssignmentService,
        @Inject() private readonly surveyService: SurveyService
    ) { }

    @Get('text-questions/:id')
    async getTextAnswers(@Param('id') surveyId: string) {
        return await this.analyticsService.getTextAnswers(surveyId)
    }

    @Post(':id')
    async getAnalytics(@Param('id') surveyId: string, @Body() requestBody?: { groupsIds: string[] }) {

        return {
            survey: await this.surveyService.getSurvey({ _id: surveyId }),
            categories: await this.surveyAssignmentService.getCategoriesByAssignment(surveyId),
            analytics: await this.analyticsService.analyzeQuestions(surveyId, requestBody?.groupsIds)
        }
    }

}