import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetTasksOptions {
    @Type(() => Number)
    @IsNumber()
    limit: number = 10;

    @Type(() => Number)
    @IsNumber()
    skip: number = 0;
}
