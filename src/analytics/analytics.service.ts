import { Inject, Injectable } from "@nestjs/common";
import { CategoryService } from "src/category/category.service";
import { CategoryType } from "src/category/schema/category.schema";
import { SurveyAssignment } from "src/survey/schema/survey-assignment.schema";
import { SurveyAssignmentService } from "src/survey/survey-assignment.service";
import { SurveyService } from "src/survey/survey.service";
import { AnswersMap, CheckboxGridAnswer, MultipleChoiceGridAnswer } from "src/survey/types/answer.types";
import { QuestionType } from "src/survey/types/question.types";
import { User } from "src/user/schema/user.schema";
import { UserService } from "src/user/user.service";
import { AnalyticsResult, OptionDistribution, GridCheckboxAnalytics, GridOptionsDistribution } from "./types/analytics.types";

@Injectable()
export class AnalyticsService {

    constructor(
        @Inject() private readonly surveyService: SurveyService,
        @Inject() private readonly surveyAssignmentService: SurveyAssignmentService,
        @Inject() private readonly categoryService: CategoryService,
        @Inject() private readonly userService: UserService,
    ) { }

    async analyzeQuestions(surveyId: string, categoryId?: string) {

        const surveyToAnalyse = await this.surveyService.getSurvey({ _id: surveyId })
        const surveyAssignments = await this.getSurveyAssignments(surveyId, categoryId)

        const questions = surveyToAnalyse.questions
        const answers = surveyAssignments.map(assignment => assignment.answers)
        const answersByQuestion = {};
        const { completed, uncompleted } = this.countAnsweredAndUnanswered(answers)

        const analyticsResult: AnalyticsResult = {
            completed,
            uncompleted,
            questionsDistributions: []
        }

        questions.forEach((question) => {
            const questionId = question._id;
            const { collectedAnswers, answered, unanswered } = this.collectAnswersData(answers, questionId)

            switch (question.type) {
                case QuestionType.TEXT:
                    analyticsResult.questionsDistributions.push({
                        questionId,
                        answered,
                        unanswered
                    });
                    break;
                case QuestionType.MULTIPLE_CHOICE:
                case QuestionType.SINGLE_CHOICE: {

                    const optionsDistributionResult = this.getOptionDistribution(collectedAnswers as string[], question.options)

                    analyticsResult.questionsDistributions.push({
                        questionId,
                        answered,
                        unanswered,
                        analytics: optionsDistributionResult
                    })
                    break;
                };
                case QuestionType.CHECKBOX_GRID:
                case QuestionType.MULTIPLE_CHOICE_GRID: {
                    const gridAnalytics = this.getGridOptionsDistribution(collectedAnswers as CheckboxGridAnswer[] | MultipleChoiceGridAnswer[], question);

                    analyticsResult.questionsDistributions.push({
                        questionId,
                        answered,
                        unanswered,
                        analytics: gridAnalytics
                    });
                    break;
                }
            }

            answersByQuestion[questionId] = collectedAnswers;
        });

        return analyticsResult
    }

    async getTextAnswers(surveyId: string) {

        const surveyToAnalyse = await this.surveyService.getSurvey({ _id: surveyId });
        const surveyAssignments = await this.surveyAssignmentService.searchSurveyAssignments({ "survey._id": surveyId }) as SurveyAssignment[];

        const textQuestions = surveyToAnalyse.questions.filter(
            (question) => question.type === QuestionType.TEXT
        );

        const textAnswersByQuestion = {};

        textQuestions.forEach((question) => {
            const questionId = question._id;

            const collectedAnswers = surveyAssignments.flatMap((assignment) => {
                const answerMap = assignment.answers;
                if (!answerMap) return [];
                const answer = answerMap.get(questionId);
                return answer ? [answer] : [];
            });

            textAnswersByQuestion[questionId] = { questionText: question.questionText, collectedAnswers };
        });



        return Object.keys(textAnswersByQuestion).map(key => ({
            _id: key,
            questionText: textAnswersByQuestion[key].questionText,
            answers: textAnswersByQuestion[key].collectedAnswers
        }));
    }

    async getSurveyAssignments(surveyId: string, categoryId?: string) {

        if (!categoryId) {
            return await this.surveyAssignmentService.searchSurveyAssignments({ "survey._id": surveyId }) as SurveyAssignment[]
        }

        const groupsWithParentIds = (await this.categoryService.getCategoriesByParentId({ parentId: categoryId, categoryType: CategoryType.GROUP }))
            .map(category => category?._id)
        const usersIds = (await this.userService.searchUsers({ groupId: { $in: groupsWithParentIds } }) as User[]).map(user => user._id)
        return await this.surveyAssignmentService.searchSurveyAssignments({ "survey._id": surveyId, studentId: { $in: usersIds } }) as SurveyAssignment[]
    }

    private countAnsweredAndUnanswered(answers: (AnswersMap | undefined)[]): { completed: number; uncompleted: number } {
        return answers.reduce(
            (acc, answer) => {
                if (answer) acc.completed++;
                else acc.uncompleted++;
                return acc;
            },
            { completed: 0, uncompleted: 0 }
        );
    }

    private collectAnswersData(answers: (AnswersMap | undefined)[], questionId: string) {
        let answered = 0;
        let unanswered = 0;

        const collectedAnswers = answers.flatMap((answerMap) => {
            if (!answerMap) {
                unanswered++;
                return [];
            }
            const answer = answerMap.get(questionId);
            if (answer) {
                answered++;
            } else {
                unanswered++;
            }
            return Array.isArray(answer) ? answer : [answer];
        });

        return { collectedAnswers, answered, unanswered };
    }

    private getOptionDistribution(collectedAnswers: string[], options: { _id: string }[]) {

        const totalAnswers = collectedAnswers?.length
        const selectedOptionsMap = new Map<string, number>()
        collectedAnswers.forEach(questionAnswer => {
            selectedOptionsMap.set(questionAnswer, (selectedOptionsMap.get(questionAnswer) || 0) + 1)
        })

        const optionsDistributionResult: OptionDistribution[] = []
        options.forEach(option => {

            const selectedCount = selectedOptionsMap.get(option._id) || 0
            const percentage = totalAnswers > 0
                ? parseFloat(((100 * selectedCount) / totalAnswers).toFixed(2))
                : 0;

            optionsDistributionResult.push({
                _id: option._id,
                percentage,
                selectedCount
            })
        })

        return optionsDistributionResult
    }

    private getGridOptionsDistribution(
        collectedAnswers: CheckboxGridAnswer[] | MultipleChoiceGridAnswer[],
        question: { _id: string; options: { _id: string }[]; rows: { _id: string }[] }
    ): GridCheckboxAnalytics {

        const gridOptionsDistribution: GridOptionsDistribution[] = [];

        const allAnswersGridMap = new Map<string, string[]>();
        collectedAnswers?.forEach((answer) => {

            if ('columns' in answer) {

                allAnswersGridMap.set(answer.row, (allAnswersGridMap.get(answer.row)?.concat(answer.columns)) || answer.columns);
            } else if ('column' in answer) {

                allAnswersGridMap.set(answer.row, (allAnswersGridMap.get(answer.row)?.concat(answer.column)) || [answer.column]);
            }
        });

        allAnswersGridMap?.forEach((columns, rowId) => {
            const rowOptionsDistribution: OptionDistribution[] = this.getOptionDistribution(columns || [], question.options);
            gridOptionsDistribution.push({
                rowId,
                rowOptionsDistribution
            });
        });

        const mostSelectedColumn = gridOptionsDistribution
            ?.flatMap(item => item.rowOptionsDistribution)
            .reduce((acc: OptionDistribution | undefined, currentValue: OptionDistribution) => {
                if (!acc || currentValue.selectedCount > acc.selectedCount) {
                    return { _id: currentValue._id, selectedCount: currentValue.selectedCount };
                }
                return acc;
            }, undefined);

        return {
            mostSelectedColumn: mostSelectedColumn || { _id: '', selectedCount: 0 },
            gridOptionsDistribution
        };
    }

}