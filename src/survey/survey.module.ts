import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Survey, SurveySchema } from './schema/survey.schema';
import { FilteringModule } from 'src/filtering/filtering.module';
import { PaginationModule } from 'src/pagination/pagination.module';
import { SurveyService } from './survey.service';
import { SurveyController } from './survey.controller';

@Module({
    imports: [MongooseModule.forFeature([{ name: Survey.name, schema: SurveySchema }]), PaginationModule, FilteringModule],
    controllers: [SurveyController],
    providers: [SurveyService],
})
export class SurveyModule { }