import { Controller, Get, Inject, Param, Post, Query } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";

@Controller('analytics')
export class AnalyticsController {

    constructor(
        @Inject() private readonly analyticsService: AnalyticsService
    ) { }

    @Get(':id')
    async getAnalytics(@Param('id') surveyId: string, @Query('categoryId') categoryId?: string) {
        return await this.analyticsService.analyzeQuestions(surveyId, categoryId)
    }

    @Get('text-questions/:id')
    async getTextAnswers(@Param('id') surveyId: string, @Query('categoryId') categoryId: string) {
        return await this.analyticsService.getSurveyAssignments(surveyId, categoryId)
    }

}