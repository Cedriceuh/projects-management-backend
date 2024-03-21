import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  readonly username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  readonly password?: string;
}
