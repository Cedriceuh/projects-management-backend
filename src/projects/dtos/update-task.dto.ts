import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

export class UpdateTaskDto {
  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
