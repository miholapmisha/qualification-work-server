import { PageMetaDtoParameters } from "./page-meta-parameters.interface";

export class PageMetaDto {
    readonly page: number
    readonly itemCount: number
    readonly pageCount: number
    readonly hasPreviousPage: boolean
    readonly hasNextPage: boolean
    readonly take: number

    constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
        this.page = pageOptionsDto.page ?? 1;
        this.take = pageOptionsDto.take ?? 10;
        this.itemCount = itemCount;
        this.pageCount = Math.ceil(this.itemCount / this.take);
        this.hasPreviousPage = this.page > 1;
        this.hasNextPage = this.page < this.pageCount;
    }
}