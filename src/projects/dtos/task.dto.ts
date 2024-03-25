import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

export class TaskDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsEnum(TaskStatus)
  readonly status: TaskStatus;
}
