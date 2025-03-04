import { Body, Controller, Get, Inject, Param, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserRequest } from "./dto/create-user.request";
import { plainToInstance } from "class-transformer";
import { UserResponse } from "./dto/user.response";

@Controller('user')
export class UserController {

    constructor (@Inject() private readonly userService: UserService) {}

    @Post('create')
    async createUser(@Body() request: CreateUserRequest) {
        await this.userService.createUser(request)
    }

    @Get(':id')
    async findUser(@Param('id') id: string) {
        const user = await this.userService.findUserById(id)
        return plainToInstance(UserResponse, user)
    }
}