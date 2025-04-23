import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Survey } from "./schema/survey.schema";
import { SurveyRequestEntity } from "./dto/survey.request-entity";
import { FilterQuery, Model } from "mongoose";
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
        console.log("query", query)
        console.log("updatedSurvey", survey)

        if (!survey) {
            throw new NotFoundException("Survey not found")
        }

        return survey
    }

    async updateSurvey(query: FilterQuery<Survey>, survey: SurveyRequestEntity) {
        const updatedSurvey = await this.surveyModel.findOneAndUpdate(query, survey, { new: true })

        if (!updatedSurvey) {
            throw new NotFoundException("Survey not found")
        }

        if (updatedSurvey.assigned) {
            throw new BadRequestException("Unable to modify survey, survey is already assigned")
        }

        return updatedSurvey
    }

    async deleteSurvey(query: FilterQuery<Survey>) {
        const deletedSurvey = await this.surveyModel.findOneAndDelete(query)

        if (!deletedSurvey) {
            throw new NotFoundException("Survey not found")
        }

        if (deletedSurvey.assigned) {
            throw new BadRequestException("Unable to delete survey, survey is already assigned")
        }

        return deletedSurvey
    }

}