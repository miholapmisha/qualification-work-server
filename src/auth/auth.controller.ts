import { Controller, Inject, Post, Request, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { UserResponse } from 'src/user/dto/user.response';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) {}

    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(@Request() request, @Res({passthrough: true}) response) {
        await this.authService.login(request.user, response)
        return plainToInstance(UserResponse, request.user) 
    }

    @Post('logout')
    async logout(@Res({passthrough: true}) response) {
        await this.authService.logout(response)
    }

    @Post('refresh')
    @UseGuards(JwtRefreshAuthGuard)
    async refresh(@Request() request, @Res({passthrough: true}) response) {
        await this.authService.login(request.user, response)
    }
}
