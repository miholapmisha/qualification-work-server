import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { randomUUID } from "crypto";

export enum CategoryType {
    FACULTY = "faculty",
    SPECIALTY = "specialty",
    DEGREE = "degree",
    YEAR = "year",
    GROUP = "group"
}

@Schema()
export class Category {

    @Prop({ _id: true, type: String, default: () => randomUUID() })
    _id: string;

    @Prop({ required: true })
    name: string;

    @Prop({ index: true })
    path: string;

    @Prop({ required: true, enum: CategoryType })
    categoryType: CategoryType
}

export const CategorySchema = SchemaFactory.createForClass(Category)