import { BadRequestException, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class JwtRefreshMiddleware implements NestMiddleware {

    use(request: Request, response: Response, next: NextFunction) {

        if(!request.cookies?.Refresh) {
            throw new BadRequestException("Refresh token is missing")
        }

        next()
    }
}