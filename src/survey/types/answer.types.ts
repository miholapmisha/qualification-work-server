export class CheckboxGridAnswer {
    row: string;
    columns: string[]
}

export class MultipleChoiceGridAnswer {
    row: string;
    column: string
}

export type QuestionAnswer = 
    | string 
    | string[] 
    | CheckboxGridAnswer 
    | MultipleChoiceGridAnswer
    | undefined;

export type AnswersMap = Map<string, QuestionAnswer>