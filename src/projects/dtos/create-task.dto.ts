import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
