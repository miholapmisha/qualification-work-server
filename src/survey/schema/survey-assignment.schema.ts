import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { Survey } from './survey.schema';
import { AnswersMap, QuestionAnswer } from '../types/answer.types';

@Schema()
export class SurveyAssignment {

    @Prop({
        type: Object,
        required: true,
    })
    survey: Survey;

    @Prop({
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    })
    studentId: Types.ObjectId;

    @Prop({
        type: Map,
        of: SchemaTypes.Mixed
    })
    answers?: AnswersMap;

    @Prop({ type: Date, default: Date.now })
    assignedAt?: Date;
}

export const SurveyAssignmentSchema = SchemaFactory.createForClass(SurveyAssignment);