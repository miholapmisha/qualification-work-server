import {IsNotEmpty, IsNotEmptyObject } from "class-validator";
import { AnswersMap } from "src/survey/types/answer.types";

export class AnswersEntity {

    @IsNotEmpty()
    answers: AnswersMap
}