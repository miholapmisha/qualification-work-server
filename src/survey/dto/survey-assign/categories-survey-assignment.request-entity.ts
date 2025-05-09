import { Type } from "class-transformer";
import { ArrayMinSize, IsNotEmpty } from "class-validator";
import { Survey } from "src/survey/schema/survey.schema";

export class CategoriesSurveyAssignmentRequestEntity {

    @IsNotEmpty()
    @ArrayMinSize(1)
    assignCategoriesIds: string[];

    @IsNotEmpty()
    @Type(() => Survey)
    survey: Survey;
}