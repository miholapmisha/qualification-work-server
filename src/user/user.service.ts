import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schema/user.schema";
import { FilterQuery, Model, UpdateQuery } from "mongoose";
import { hash } from "bcryptjs";
import { PageOptionsDto } from "src/pagination/dto/page-options.dto";
import { CreateUserRequest } from "./dto/user.create-user-request";
import { PaginationService } from "src/pagination/pagination.service";

@Injectable()
export class UserService {

    constructor(@InjectModel(User.name) private readonly userModel: Model<User>, @Inject() private readonly paginationService: PaginationService) { }

    async createUser(data: CreateUserRequest) {
        return await new this.userModel({
            ...data,
            password: await hash(data.password, 10)
        }).save()
    }

    async searchUsers(query: FilterQuery<User>, pageOptionsDto?: PageOptionsDto) {
        if (pageOptionsDto) {
            return this.paginationService.paginate(this.userModel, query, pageOptionsDto);
        } else {
            return this.paginationService.getAll(this.userModel, query);
        }
    }

    async getUser(query: FilterQuery<User>) {
        const user = await this.userModel.findOne(query)

        if (!user) {
            throw new NotFoundException("User not found")
        }

        return user
    }

    async updateUser(query: FilterQuery<User>, data: UpdateQuery<User>) {
        const updatedUser = await this.userModel.findOneAndUpdate(query, data, {
            new: true,
            lean: true
        })
        if (!updatedUser) {
            throw new NotFoundException("User not found")
        }

        return updatedUser
    }

    async updateUsers(query: FilterQuery<User>, data: UpdateQuery<User>) {
        await this.userModel.updateMany(query, data, {
            new: true,
            lean: true
        })

        return await this.userModel.find(query).lean()
    }

    async deleteUser(query: FilterQuery<User>) {
        const user = await this.userModel.findOneAndDelete(query)

        if (!user) {
            throw new NotFoundException('User not found')
        }
    }
}