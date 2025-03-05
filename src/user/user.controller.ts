import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserRequest } from "./dto/create-user.request";
import { plainToInstance } from "class-transformer";
import { UserResponse } from "./dto/user.response";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guars";


@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {

    constructor (private readonly userService: UserService) {}

    @Post('create')
    async createUser(@Body() createUserRequest: CreateUserRequest) {
        await this.userService.createUser(createUserRequest)
    }

    @Get('current')
    async checkCurrentUser(@Request() request) {
        return plainToInstance(UserResponse, request.user)
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findUser(@Param('id') id: string) {
        const user = await this.userService.getUser({_id: id})
        return plainToInstance(UserResponse, user)
    }
}