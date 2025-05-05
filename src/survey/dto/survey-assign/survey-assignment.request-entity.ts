import { IsNotEmpty, ValidateNested } from "class-validator";
import { SurveyRequestEntity } from "../survey/survey.request-entity";

export class SurveyAssignmentRequestEntity {

    @IsNotEmpty()
    survey: SurveyRequestEntity;

    @IsNotEmpty()
    @ValidateNested()
    studentId: string;
}