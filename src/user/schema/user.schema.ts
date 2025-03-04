import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";

export enum UserRole {
    GUEST = 'guest',
    STUDENT = 'student',
    TEACHER = 'teacher',
    ADMIN = 'admin'
}

@Schema()
export class User {

    @Prop({type: SchemaTypes.ObjectId, auto: true})
    _id: Types.ObjectId

    @Prop({unique: true})
    email: string

    @Prop()
    password: string

    @Prop()
    name: string

    @Prop({ type: [String], enum: UserRole, default: [UserRole.GUEST] })
    roles: UserRole[];
}

export const UserSchema = SchemaFactory.createForClass(User)