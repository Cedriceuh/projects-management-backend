import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
