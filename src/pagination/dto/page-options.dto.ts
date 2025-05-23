import { Type } from "class-transformer";
import { IsInt, Min, IsOptional, Max } from "class-validator";

export class PageOptionsDto {

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    readonly page: number = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    @IsOptional()
    readonly take: number = 10;

    get skip(): number {
        return (this.page - 1) * this.take;
    }

    constructor(page, take) {
        this.page = page
        this.take = take
    }
}
