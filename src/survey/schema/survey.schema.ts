import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { Question, QuestionType } from '../types/question.types';

enum SurveyStatus {
    IN_PROGRESS = 'in_progress',
    PUBLISHED = 'published',
}


@Schema({ timestamps: true })
export class Survey {

    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId;

    @Prop()
    title?: string;

    @Prop()
    description?: string;

    @Prop({
        type: String,
        enum: SurveyStatus,
        default: SurveyStatus.IN_PROGRESS
    })
    status: SurveyStatus;

    @Prop({
        type: [Object],
        required: true,
        validate: [
            {
                validator: (questions) => {
                    return questions.every(q =>
                        q._id &&
                        q.type &&
                        Object.values(QuestionType).includes(q.type)
                    );
                },
                message: 'Questions must have a valid type and id'
            },
            {
                validator: (questions) => {
                    const ids = questions.map(q => q._id);
                    return new Set(ids).size === ids.length;
                },
                message: 'Question IDs must be unique within a survey'
            }]
    })
    questions: Array<Question>;

    @Prop({
        type: Types.ObjectId,
        required: true,
        ref: 'User'
    })
    authorId: Types.ObjectId;

    @Prop({type: Boolean, default: false})
    assigned?: boolean;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;
}

export const SurveySchema = SchemaFactory.createForClass(Survey);

export { QuestionType };