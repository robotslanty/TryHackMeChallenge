import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './schemas/task.schema';
import { AddTaskDto } from './dto/add-task.dto';
import { EditTaskDto } from './dto/edit-task.dto';
import { GetTasksOptions } from './dto/get-tasks-options.dto';

@Injectable()
export class TaskService {
    constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

    getTasks(userId: string, options: GetTasksOptions = { limit: 10, skip: 0 }) {
        return this.taskModel.find({ userId }, null, options);
    }

    async getTaskById(userId: string, taskId: string) {
        const task = await this.taskModel.findOne({
            _id: taskId,
            userId,
        });

        if (!task) {
            throw new NotFoundException('No task found');
        }

        return task;
    }

    addTask(userId: string, dto: AddTaskDto) {
        const task = new this.taskModel({ userId, ...dto });
        return task.save();
    }

    async editTask(userId: string, taskId: string, dto: EditTaskDto) {
        let task = await this.getTaskById(userId, taskId);
        task = Object.assign(task, dto);
        return task.save();
    }

    async deleteTaskById(userId: string, taskId: string) {
        const task = await this.getTaskById(userId, taskId);
        const result = await this.taskModel.deleteOne({ _id: taskId });

        if (result.deletedCount !== 1) {
            throw new InternalServerErrorException('Unable to delete task');
        }

        return task;
    }
}
