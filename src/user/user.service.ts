import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserRole } from "./schema/user.schema";
import { Model, Types } from "mongoose";
import { CreateUserRequest } from "./dto/create-user.request";
import { hash } from "bcryptjs";

@Injectable()
export class UserService {

    constructor (@InjectModel(User.name) private readonly userModel: Model<User>) {}

    async createUser(data: CreateUserRequest) {
        await new this.userModel({
            ...data,
            password: await hash(data.password, 10)
        }).save()
    }

    async findUserById(id: string): Promise<User> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid user ID format");
        }

        const user = await this.userModel.findById(id)

        if(!user) {
            throw new NotFoundException("User not found")
        }

        return user
    }
}