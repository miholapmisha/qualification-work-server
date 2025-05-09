import { Module } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { SurveyModule } from "src/survey/survey.module";
import { AnalyticsController } from "./analytics.controller";
import { CategoryModule } from "src/category/category.module";
import { UserModule } from "src/user/user.module";

@Module({
    imports: [SurveyModule, CategoryModule, UserModule],
    controllers: [AnalyticsController],
    providers: [AnalyticsService]
})
export class AnalyticsModule { }