import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Survey, SurveyStatus } from "./schema/survey.schema";
import { SurveyRequestEntity } from "./dto/survey/survey.request-entity";
import { FilterQuery, Model, UpdateQuery } from "mongoose";
import { PageOptionsDto } from "src/pagination/dto/page-options.dto";
import { PaginationService } from "src/pagination/pagination.service";

@Injectable()
export class SurveyService {

    constructor(@InjectModel(Survey.name) private readonly surveyModel: Model<Survey>, @Inject() private readonly paginationService: PaginationService) { }

    async addSurvey(survey: SurveyRequestEntity): Promise<Survey> {
        return await new this.surveyModel(survey).save();
    }

    async searchSurveys(query: FilterQuery<Survey>, pageOptionsDto?: PageOptionsDto) {
        if (pageOptionsDto) {
            return this.paginationService.paginate(this.surveyModel, query, pageOptionsDto);
        } else {
            return this.surveyModel.find(query);
        }
    }

    async getSurvey(query: FilterQuery<Survey>) {
        const survey = await this.surveyModel.findOne(query)

        if (!survey) {
            throw new NotFoundException("Survey not found")
        }

        return survey
    }

    async changeSurveysStatus(query: FilterQuery<Survey>, status: SurveyStatus) {
        return await this.surveyModel.updateMany(query, { $set: { status } })
    }

    async updateSurvey(query: FilterQuery<Survey>, data: UpdateQuery<Survey>) {
        const updatedSurvey = await this.surveyModel.findOneAndUpdate(query, data, { new: true })

        if (!updatedSurvey) {
            throw new NotFoundException("Survey not found")
        }

        if (updatedSurvey.status === "published") {
            throw new BadRequestException("Unable to modify survey, survey is already assigned")
        }

        return updatedSurvey
    }

    async deleteSurvey(query: FilterQuery<Survey>) {
        const deletedSurvey = await this.surveyModel.findOneAndDelete(query)

        if (!deletedSurvey) {
            throw new NotFoundException("Survey not found")
        }

        if (deletedSurvey.status === "published") {
            throw new BadRequestException("Unable to delete survey, survey is already assigned")
        }

        return deletedSurvey
    }

}