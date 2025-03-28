import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { plainToInstance } from "class-transformer";
import { UserResponse } from "./dto/user.response";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guars";
import { PageOptionsDto } from "src/pagination/dto/page-options.dto";
import { CreateUserRequest } from "./dto/user.create-user-request";
import { UpdateUserRequest } from "./dto/user.update-user-request";


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
    async deleteUser(@Param('id') _id: string) {
        await this.userService.deleteUser({ _id })
    }

    @Put(':id')
    async updateUser(@Param('id') _id: string, @Body() user: UpdateUserRequest) {
        console.log("User: ", user)
        console.log("Id: ", _id)
        return plainToInstance(UserResponse, await this.userService.updateUser({ _id }, { $set: user }))
    }
}