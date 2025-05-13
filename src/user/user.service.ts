import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schema/user.schema";
import { FilterQuery, Model, UpdateQuery } from "mongoose";
import { hash } from "bcryptjs";
import { PageOptionsDto } from "src/pagination/dto/page-options.dto";
import { CreateUserRequest } from "./dto/user.create-user-request";
import { PaginationService } from "src/pagination/pagination.service";

@Injectable()
export class UserService {

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @Inject() private readonly paginationService: PaginationService
    ) { }

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
            return this.userModel.find(query);
        }
    }

    async getUser(query: FilterQuery<User>) {
        const user = await this.userModel.findOne(query).populate('group')

        if (!user) {
            throw new NotFoundException("User not found")
        }

        return user.toObject()
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

    async assignUsersToGroup(groupId: string, usersIds: string[]) {
        const alreadyAssignedUsers = await this.userModel.findOne({
            _id: { $in: usersIds },
            $and: [
                { groupId: { $exists: true, $ne: null } },
                { groupId: { $ne: groupId } }
            ]
        });

        if (alreadyAssignedUsers) {
            throw new BadRequestException('Some users are already assigned to a group');
        }

        await this.userModel.updateMany(
            {
                $and: [
                    { groupId },
                    { _id: { $nin: usersIds } }
                ]
            },
            { $unset: { groupId: '' } }
        )
        await this.userModel.updateMany(
            { _id: { $in: usersIds } },
            { $set: { groupId } }
        )
    }

    async deleteUser(query: FilterQuery<User>) {
        const user = await this.userModel.findOneAndDelete(query)

        if (!user) {
            throw new NotFoundException('User not found')
        }
    }
}