import { Exclude, Expose } from "class-transformer";
import { Question, QuestionType } from "../../types/question.types";
import { SurveyStatus } from "../../schema/survey.schema";

@Exclude()
export class SurveyResponseEntity {
    @Expose()
    _id: string;

    @Expose()
    title: string;

    @Expose()
    description: string;

    @Expose()
    questionType: QuestionType;

    @Expose()
    questions: Array<Question>;

    @Expose()
    authorId: string;

    @Expose()
    status: SurveyStatus;

    @Expose()
    createdAt: Date;
}