import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { TaskDto } from './task.dto';

export class ProjectDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  readonly name: string;

  @IsString()
  readonly description: string;

  @IsMongoId()
  readonly creatorId: string;

  @IsOptional()
  readonly tasks?: TaskDto[];
}
