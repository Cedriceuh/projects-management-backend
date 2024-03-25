import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Task } from './task.schema';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  _id: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  creatorId: mongoose.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    default: [],
  })
  tasks?: Task[];
}

const ProjectSchema = SchemaFactory.createForClass(Project);

export { ProjectSchema };
