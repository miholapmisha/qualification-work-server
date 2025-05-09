import { Exclude, Expose, Transform, Type } from "class-transformer";
import { SurveyResponseEntity } from "../survey/survey.response";

@Exclude()
export class AssignmentResponse {

    @Expose()
    assignedAt: Date

    @Expose()
    @Type(() => SurveyResponseEntity)
    survey: SurveyResponseEntity

    @Expose()
    @Transform(({ value }) => {
        
        if (value) {
            return value.size
        }
        return undefined;
    })
    answers: number | undefined;
}