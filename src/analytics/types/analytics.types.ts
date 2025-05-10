export class AnalyticsResult {
    completed: number
    uncompleted: number
    questionsDistributions: QuestionDistibution[]
}

export class QuestionDistibution {
    questionId: string
    answered: number
    unanswered: number
    analytics?: OptionDistribution[] | GridCheckboxAnalytics
}

export class GridCheckboxAnalytics {
    mostSelectedColumn?: { _id: string, selectedCount: number }
    gridOptionsDistribution: GridOptionsDistribution[]
}

export class OptionDistribution {
    _id: string
    percentage: number
    selectedCount: number
}

export class GridOptionsDistribution {
    rowId: string;
    rowOptionsDistribution: OptionDistribution[]
}