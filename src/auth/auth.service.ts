import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { Response } from 'express';
import { User } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) {}

    async login(user: User, response: Response) {
        const expiresAccessToken = new Date()
        expiresAccessToken.setTime(
            expiresAccessToken.getTime() + parseInt(this.configService.getOrThrow<string>('ACCESS_TOKEN_EXPIRATION_MS'))
        )

        const expiresRefreshToken = new Date()
        expiresRefreshToken.setTime(
            expiresAccessToken.getTime() + parseInt(this.configService.getOrThrow<string>('REFRESH_TOKEN_EXPIRATION_MS'))
        )

        const tokenPayload: TokenPayload = {
            userId: user._id.toHexString()
        }

        const accessToken = this.jwtService.sign(tokenPayload, {
            secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: `${this.configService.getOrThrow<string>('ACCESS_TOKEN_EXPIRATION_MS')}ms`
        })

        const refreshToken = this.jwtService.sign(tokenPayload, {
            secret: this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: `${this.configService.getOrThrow<string>('REFRESH_TOKEN_EXPIRATION_MS')}ms`
        }) 

        await this.userService.updateUser({_id: user._id}, {$set: {refreshToken: await hash(refreshToken, 10)}})

        response.cookie('Authentication', accessToken, {
            httpOnly: true, 
            secure: this.configService.getOrThrow<string>('NODE_ENV') === 'prod',
            expires: expiresAccessToken
        })
        response.cookie('Refresh', refreshToken, {
            httpOnly: true, 
            secure: this.configService.getOrThrow<string>('NODE_ENV') === 'prod',
            expires: expiresRefreshToken
        })
    }

    async logout(response: Response) {
        
        response.cookie('Authentication', '', {
            httpOnly: true, 
            secure: this.configService.getOrThrow<string>('NODE_ENV') === 'prod',
            expires: new Date(0)
        })
        response.cookie('Refresh', '', {
            httpOnly: true, 
            secure: this.configService.getOrThrow<string>('NODE_ENV') === 'prod',
            expires: new Date(0)
        })
    }

    async verifyUser(email: string, password: string) {
        try {
            
            const user = await this.userService.getUser({email})
            const auth = await compare(password, user.password)

            if(!auth) {
                throw new UnauthorizedException()
            }

            return user
        } catch(err) {
            throw new UnauthorizedException("Credential are not valid")
        }
    }

    async verifyUserRefreshToken(refreshToken: string, userId: string) {
        try {
            const user = await this.userService.getUser({_id: userId})
            
            if (!user.refreshToken || !(await compare(refreshToken, user.refreshToken))) {
                throw new UnauthorizedException()
            }

            return user
        } catch (err) {
            throw new UnauthorizedException('Refresh token is not valid')
        }
    }
}