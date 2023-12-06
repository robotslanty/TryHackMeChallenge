import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '../schemas/task.schema';

export class EditTaskDto {
    @IsOptional()
    title?: string;

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    description?: string;

    @IsOptional()
    @IsDate()
    dueAt?: Date;
}
