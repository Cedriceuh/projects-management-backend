import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Task, TaskSchema } from './task.schema';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  creatorId: string;

  @Prop({ type: [TaskSchema], default: [] })
  tasks?: Task[];
}

const ProjectSchema = SchemaFactory.createForClass(Project);

export { ProjectSchema };
