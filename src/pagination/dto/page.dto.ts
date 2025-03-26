import { PageMetaDto } from "./meta/page-meta.dto"

export class PageDto<T> {
    readonly data: T[]
    readonly metaData: PageMetaDto

    constructor(data: T[], metaData: PageMetaDto) {
        this.data = data;
        this.metaData = metaData;
    }
}