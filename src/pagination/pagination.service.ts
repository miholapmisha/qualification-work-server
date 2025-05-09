import { Injectable } from "@nestjs/common";
import { Model, FilterQuery } from "mongoose";
import { PageMetaDto } from "./dto/meta/page-meta.dto";
import { PageOptionsDto } from "./dto/page-options.dto";
import { PageDto } from "./dto/page.dto";

@Injectable()
export class PaginationService {

    async paginate<T>(
        model: Model<T>,
        query: FilterQuery<T> = {},
        pageOptionsDto: PageOptionsDto
    ): Promise<PageDto<T>> {

        const { take, skip } = pageOptionsDto;
        const [items, itemCount] = await Promise.all([
            model.find(query)
                .skip(skip)
                .limit(take)
                .exec(),
            model.countDocuments(query).exec(),
        ]);

        const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

        return new PageDto(items, pageMetaDto);
    }

    async getAll<T>(
        model: Model<T>,
        query: FilterQuery<T> = {}
    ): Promise<T[]> {
        return await model.find(query);
    }
}