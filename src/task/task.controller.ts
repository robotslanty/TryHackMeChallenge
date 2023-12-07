import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { AddTaskDto } from './dto/add-task.dto';
import { EditTaskDto } from './dto/edit-task.dto';
import { GetUser } from '../user/get-user.decorator';
import { UserDocument } from '../user/schemas/user.schema';
import { TaskService } from './task.service';
import { GetTasksOptions } from './dto/get-tasks-options.dto';

@Controller('tasks')
@UseGuards(JwtGuard)
export class TaskController {
    constructor(private taskService: TaskService) {}

    @Get()
    getTasks(@GetUser() user: UserDocument, @Query() query: GetTasksOptions) {
        return this.taskService.getTasks(user._id.toString(), query);
    }

    @Get(':id')
    getTask(@GetUser() user: UserDocument, @Param('id') taskId: string) {
        return this.taskService.getTaskById(user._id.toString(), taskId);
    }

    @Post()
    addTask(@GetUser() user: UserDocument, @Body() dto: AddTaskDto) {
        return this.taskService.addTask(user._id.toString(), dto);
    }

    @Patch(':id')
    editTask(@GetUser() user: UserDocument, @Param('id') taskId: string, @Body() dto: EditTaskDto) {
        return this.taskService.editTask(user._id.toString(), taskId, dto);
    }

    @Delete(':id')
    deleteTask(@GetUser() user: UserDocument, @Param('id') taskId: string) {
        return this.taskService.deleteTaskById(user._id.toString(), taskId);
    }
}
