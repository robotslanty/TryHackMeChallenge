import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { TaskStatus } from '../schemas/task.schema';

export class AddTaskDto {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    @IsEnum(TaskStatus)
    status: TaskStatus;

    @IsOptional()
    description?: string;

    @IsDateString()
    @IsOptional()
    dueAt?: Date;
}
