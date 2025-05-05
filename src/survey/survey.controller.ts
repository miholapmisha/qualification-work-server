import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from "@nestjs/common";
import { SurveyRequestEntity } from "./dto/survey/survey.request-entity";
import { SurveyService } from "./survey.service";
import { PageOptionsDto } from "src/pagination/dto/page-options.dto";
import { FilteringService } from "src/filtering/filtering.service";
import { SurveyResponseEntity } from "./dto/survey/survey.response";
import { plainToInstance } from "class-transformer";

@Controller('survey')
export class SurveyController {

    constructor(@Inject() private readonly surveyService: SurveyService, @Inject() private readonly filteringService: FilteringService) { }

    @Get(':id')
    async getSurvey(@Param('id') id: string) {
        console.log("Id: ", id)
        return plainToInstance(SurveyResponseEntity, await this.surveyService.getSurvey({ _id: id }))
    }

    @Put(':id')
    async updateSurvey(@Param('id') id: string, @Body() survey: SurveyRequestEntity) {
        return plainToInstance(SurveyResponseEntity, await this.surveyService.updateSurvey({ _id: id }, { $set: survey }))
    }

    @Post('create')
    async createSurvey(@Body() survey: SurveyRequestEntity) {
        return plainToInstance(SurveyResponseEntity, await this.surveyService.addSurvey(survey))
    }

    @Post('search')
    async searchSurveys(@Body() searchParams, @Query() pageParams: PageOptionsDto) {

        return await this.filteringService.search(
            searchParams,
            pageParams,
            this.surveyService.searchSurveys.bind(this.surveyService),
            SurveyResponseEntity
        )
    }

    @Delete(':id')
    async deleteSurvey(@Param('id') id: string) {
        return await this.surveyService.deleteSurvey({ _id: id })
    }
}