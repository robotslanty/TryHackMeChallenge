import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

export enum TaskStatus {
    OPEN = 'open',
    CLOSED = 'closed',
}

@Schema()
export class Task {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true, index: true })
    status: TaskStatus;

    @Prop({ required: true, index: true })
    userId: string;

    @Prop()
    description?: string;

    @Prop({ index: true })
    dueAt?: Date;

    @Prop({ required: true })
    createdAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
