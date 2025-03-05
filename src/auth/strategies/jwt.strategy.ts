import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";
import { TokenPayload } from "../token-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

    constructor(
        private configService: ConfigService,
        private userService: UserService
    ){
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => request.cookies?.Authentication
            ]),
            secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET')
        })
    }

    async validate(payload: TokenPayload) {
        return await this.userService.getUser({_id: payload.userId})
    }
}