import { FilterQuery } from "mongoose"

export enum FilterOperator {
    EQ = 'eq',
    NE = 'ne',
    GT = 'gt',
    GTE = 'gte',
    LT = 'lt',
    LTE = 'lte',
    IN = 'in',
    NIN = 'nin',
    REGEX = 'regex',
    OR = 'or',
    AND = 'and',
    EXISTS = 'exists'
}

export class FilterDto<T> {
    field: string
    operator: FilterOperator
    value: FilterQuery<T>
}