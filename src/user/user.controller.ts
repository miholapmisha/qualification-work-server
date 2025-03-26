import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserRequest } from "./dto/create-user.request";
import { plainToInstance } from "class-transformer";
import { UserResponse } from "./dto/user.response";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guars";
import { PageOptionsDto } from "src/pagination/dto/page-options.dto";


@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {

    constructor(private readonly userService: UserService) { }

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
        const user = await this.userService.getUser({ _id: id })
        return plainToInstance(UserResponse, user)
    }

    @Get()
    async getUsers(@Query() pageOptionsDto: PageOptionsDto,) {
        const { metaData, data } = await this.userService.getUsers(pageOptionsDto)
        return { metaData, data: data.map(user => plainToInstance(UserResponse, user)) }
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        await this.userService.deleteUser(id)
    }
}