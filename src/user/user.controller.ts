import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { plainToInstance } from "class-transformer";
import { UserResponse } from "./dto/user.response";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guars";
import { PageOptionsDto } from "src/pagination/dto/page-options.dto";
import { CreateUserRequest } from "./dto/user.create-user-request";
import { UpdateUserRequest } from "./dto/user.update-user-request";
import { ValidationUserCredentialsInterceptor } from "./interceptors/validation-user-credentials.interceptor";
import { PageDto } from "src/pagination/dto/page.dto";
import { User } from "./schema/user.schema";
import { FilteringService } from "src/filtering/filtering.service";


@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {

    constructor(private readonly userService: UserService, private readonly filteringService: FilteringService) { }

    @Post('create')
    @UseInterceptors(ValidationUserCredentialsInterceptor)
    async createUser(@Body() createUserRequest: CreateUserRequest) {
        return plainToInstance(UserResponse, await this.userService.createUser(createUserRequest))
    }

    @Put('assign')
    async assignUserToGroup(@Body() assignRequest: { usersIds: string[]; groupId: string }) {
        const { usersIds, groupId } = assignRequest
        await this.userService.assignUsersToGroup(groupId, usersIds)
    }


    @Put(':id')
    @UseInterceptors(ValidationUserCredentialsInterceptor)
    async updateUser(@Param('id') _id: string, @Body() user: UpdateUserRequest) {
        return plainToInstance(UserResponse, await this.userService.updateUser({ _id }, { $set: user }))
    }

    @Get('current')
    async checkCurrentUser(@Request() request) {
        return plainToInstance(UserResponse, request.user)
    }

    @Get(':id')
    async findUser(@Param('id') id: string) {
        return plainToInstance(UserResponse, await this.userService.getUser({ _id: id }))
    }

    @Get('/group')
    async findUsersByGroupId(@Query() groupId: string) {
        return plainToInstance(UserResponse, await this.userService.getUser({ groupId }))
    }

    //TODO: simplify
    @Post('search')
    async getUsers(@Body() searchParams, @Query() pageParams: PageOptionsDto) {
        const { page, take } = pageParams
        const filterQuery = this.filteringService.buildDynamicQuery<User>(searchParams)

        if (page && take) {
            const pageOptionsDto = new PageOptionsDto(page, take)
            const paginatedResult = await this.userService.searchUsers(filterQuery, pageOptionsDto) as PageDto<User>

            return {
                metaData: paginatedResult.metaData,
                data: paginatedResult.data.map((user) => plainToInstance(UserResponse, user))
            }
        } else {
            const users = await this.userService.searchUsers(filterQuery) as User[]
            return users.map((user) => plainToInstance(UserResponse, user))
        }
    }

    @Delete(':id')
    async deleteUser(@Param('id') _id: string) {
        await this.userService.deleteUser({ _id })
    }
}