import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schema/user.schema";
import { FilterQuery, Model, UpdateQuery } from "mongoose";
import { hash } from "bcryptjs";
import { PageOptionsDto } from "src/pagination/dto/page-options.dto";
import { PageDto } from "src/pagination/dto/page.dto";
import { PageMetaDto } from "src/pagination/dto/meta/page-meta.dto";
import { CreateUserRequest } from "./dto/user.create-user-request";

@Injectable()
export class UserService {

    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    async createUser(data: CreateUserRequest) {

        const userWithSuchEmail = await this.userModel.findOne({ email: data.email })
        if (userWithSuchEmail) {
            throw new BadRequestException("User with such email already exists")
        }

        const userWithSuchName = await this.userModel.findOne({ name: data.name })
        if (userWithSuchName) {
            throw new BadRequestException("User with such name already exists")
        }

        await new this.userModel({
            ...data,
            password: await hash(data.password, 10)
        }).save()
    }

    async getUsers(pageOptionsDto: PageOptionsDto) {
        const { take, skip } = pageOptionsDto

        const [users, total] = await Promise.all([
            this.userModel.find()
                .skip(skip)
                .limit(take)
                .exec(),
            this.userModel.countDocuments()
        ])


        const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount: total })
        return new PageDto(users, pageMetaDto)
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

    async deleteUser(query: FilterQuery<User>) {
        const user = await this.userModel.findOneAndDelete(query)

        if (!user) {
            throw new NotFoundException('User not found')
        }
    }
}