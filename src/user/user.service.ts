import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schema/user.schema";
import { FilterQuery, Model, UpdateQuery } from "mongoose";
import { CreateUserRequest } from "./dto/create-user.request";
import { hash } from "bcryptjs";
import { PageOptionsDto } from "src/pagination/dto/page-options.dto";
import { PageDto } from "src/pagination/dto/page.dto";
import { PageMetaDto } from "src/pagination/dto/meta/page-meta.dto";

@Injectable()
export class UserService {

    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    async createUser(data: CreateUserRequest) {
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
        return await this.userModel.findOneAndUpdate(query, data)
    }

    async deleteUser(id: string) {
        const user = await this.userModel.findByIdAndDelete(id)

        if (!user) {
            throw new NotFoundException('User not found')
        }
    }
}