import { Injectable } from "@nestjs/common";
import { FilterDto, FilterOperator } from "./dto/filtering.dto";
import { FilterQuery } from "mongoose";

@Injectable()
export class FilteringService {

    processFilter<T>(filter: FilterDto<T>): FilterQuery<T> {
        const { field, operator, value } = filter;

        switch (operator) {
            case FilterOperator.EQ:
                return { [field]: value } as FilterQuery<T>;

            case FilterOperator.NE:
                return { [field]: { $ne: value } } as FilterQuery<T>;

            case FilterOperator.GT:
                return { [field]: { $gt: value } } as FilterQuery<T>;

            case FilterOperator.GTE:
                return { [field]: { $gte: value } } as FilterQuery<T>;

            case FilterOperator.LT:
                return { [field]: { $lt: value } } as FilterQuery<T>;

            case FilterOperator.LTE:
                return { [field]: { $lte: value } } as FilterQuery<T>;

            case FilterOperator.IN:
                return { [field]: { $in: Array.isArray(value) ? value : [value] } } as FilterQuery<T>;

            case FilterOperator.NIN:
                return { [field]: { $nin: Array.isArray(value) ? value : [value] } } as FilterQuery<T>;

            case FilterOperator.REGEX:
                return { [field]: { $regex: value, $options: 'i' } } as FilterQuery<T>;

            case FilterOperator.EXISTS:
                return { [field]: { $exists: value } } as FilterQuery<T>;

            case FilterOperator.OR:
                if (Array.isArray(value)) {
                    return { $or: value.map(subFilter => this.processFilter<T>(subFilter)) } as FilterQuery<T>;
                }
                return {};

            case FilterOperator.AND:
                if (Array.isArray(value)) {
                    return { $and: value.map(subFilter => this.processFilter<T>(subFilter)) } as FilterQuery<T>;
                }
                return {};

            default:
                return { [field]: value } as FilterQuery<T>;
        }
    }

    buildDynamicQuery<T>(filters: FilterDto<T>[]): FilterQuery<T> {
        if (!filters || filters.length === 0 || Object.keys(filters).length <= 0) {
            return {}
        }

        if (filters.length === 1 && filters[0].operator === FilterOperator.OR && Array.isArray(filters[0].value)) {
            return {
                $or: filters[0].value.map(subFilter => this.processFilter(subFilter))
            }
        }

        return {
            $and: filters.map(filter => this.processFilter(filter))
        };
    }


}