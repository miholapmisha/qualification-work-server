import { Exclude, Expose } from "class-transformer";
import { SurveyResponseEntity } from "../survey/survey.response";

@Exclude()
export class AssignmentResponse {

    @Expose()
    assignedAt: Date

    @Expose()
    survey: SurveyResponseEntity
}