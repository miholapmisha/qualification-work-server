export enum QuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    SINGLE_CHOICE = 'single_choice',
    MULTIPLE_CHOICE_GRID = 'multiple_choice_grid',
    CHECKBOX_GRID = 'checkbox_grid',
    TEXT = 'text'
}

type Option = {
    _id: string;
    text: string;
}

type TableRow = {
    _id: string;
    text: string;
}

export interface BaseQuestion {
    _id: string
    questionText?: string
    type: QuestionType,
    required?: boolean
}

export interface TextQuestion extends BaseQuestion {
    type: QuestionType.TEXT
}

export interface SingleChoiceQuestion extends BaseQuestion {
    type: QuestionType.SINGLE_CHOICE
    options: Option[]
}

export interface MultipleChoiceQuestion extends BaseQuestion {
    type: QuestionType.MULTIPLE_CHOICE
    options: Option[],
}

export interface MultipleChoiceGrid extends BaseQuestion {
    type: QuestionType.MULTIPLE_CHOICE_GRID,
    rows: TableRow[],
    options: Option[]
}

export interface CheckboxGrid extends BaseQuestion {
    type: QuestionType.CHECKBOX_GRID,
    rows: TableRow[],
    options: Option[]
}

export type Question = TextQuestion | SingleChoiceQuestion | MultipleChoiceQuestion | MultipleChoiceGrid | CheckboxGrid