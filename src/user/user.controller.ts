import { Body, Controller, Get, Inject, Param, Post, Request, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserRequest } from "./dto/create-user.request";
import { plainToInstance } from "class-transformer";
import { UserResponse } from "./dto/user.response";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guars";


@Controller('user')
export class UserController {

    constructor (private readonly userService: UserService) {}

    @Post('create')
    async createUser(@Body() createUserRequest: CreateUserRequest) {
        await this.userService.createUser(createUserRequest)
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findUser(@Param('id') id: string, @Request() request) {
        const currentUser = request.user;
        const user = await this.userService.getUser({_id: id})
        return plainToInstance(UserResponse, user)
    }
}