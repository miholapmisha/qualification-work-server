import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Survey, SurveySchema } from './schema/survey.schema';
import { FilteringModule } from 'src/filtering/filtering.module';
import { PaginationModule } from 'src/pagination/pagination.module';
import { SurveyService } from './survey.service';
import { SurveyController } from './survey.controller';
import { SurveyAssignmentService } from './survey-assignment.service';
import { SurveyAssignmentController } from './survey-assignment.controller';
import { SurveyAssignment, SurveyAssignmentSchema } from './schema/survey-assignment.schema';
import { UserModule } from 'src/user/user.module';
import { CategoryModule } from 'src/category/category.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Survey.name, schema: SurveySchema },
            { name: SurveyAssignment.name, schema: SurveyAssignmentSchema },
        ]),
        PaginationModule,
        FilteringModule,
        UserModule,
        CategoryModule,
        CategoryModule
    ],
    controllers: [SurveyController, SurveyAssignmentController],
    providers: [SurveyService, SurveyAssignmentService],
})
export class SurveyModule { }