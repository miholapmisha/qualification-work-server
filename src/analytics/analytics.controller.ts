import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
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

    @Get(':id')
    async getAnalytics(@Param('id') surveyId: string, @Query('categoryId') categoryId?: string) {

        const survey = await this.surveyService.getSurvey({ _id: surveyId })
        if (!categoryId) {
            return {
                survey,
                categories: await this.surveyAssignmentService.getCategoriesByAssignment(surveyId),
                analytics: await this.analyticsService.analyzeQuestions(surveyId)
            }
        }

        return {
            survey,
            analytics: await this.analyticsService.analyzeQuestions(surveyId, categoryId)
        }
    }

}