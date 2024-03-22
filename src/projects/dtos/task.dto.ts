import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

export class TaskDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  status: TaskStatus;
}
