import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TaskStatus } from '../enums/task-status.enum';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ required: true, enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;
}

const TaskSchema = SchemaFactory.createForClass(Task);

export { TaskSchema };
