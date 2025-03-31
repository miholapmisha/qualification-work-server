import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../schema/user.schema";

@Injectable()
export class ValidationUserCredentialsInterceptor implements NestInterceptor {

    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const { email, name } = request.body;

        if (email) {
            const userWithSuchEmail = await this.userModel.findOne({ email });
            if (userWithSuchEmail) {
                throw new BadRequestException("User with such email already exists");
            }
        }

        if (name) {
            const userWithSuchName = await this.userModel.findOne({ name });
            if (userWithSuchName) {
                throw new BadRequestException("User with such name already exists");
            }
        }

        return next.handle();
    }
}