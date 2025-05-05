import { IsNotEmpty, IsOptional } from "class-validator";
import { Question, } from "../../types/question.types";

export class SurveyRequestEntity {

    @IsNotEmpty()
    title: string;

    @IsOptional()
    description?: string;

    @IsOptional()
    questions: Array<Question>;

    @IsNotEmpty()
    authorId: string;
}