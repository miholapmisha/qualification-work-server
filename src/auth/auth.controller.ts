import { Controller, Inject, Post, Request, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

@Controller('auth')
export class AuthController {

    constructor(
        @Inject() private readonly authService: AuthService
    ) {}

    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(@Request() request, @Res({passthrough: true}) response) {
        await this.authService.login(request.user, response)
    }

    @Post('/refresh')
    @UseGuards(JwtRefreshAuthGuard)
    async refresh(@Request() request, @Res({passthrough: true}) response) {
        await this.authService.login(request.user, response)
    }
}
