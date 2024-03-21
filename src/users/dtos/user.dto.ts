import {
  IsNotEmpty,
  IsMongoId,
  IsString,
  IsArray,
  IsEnum,
  MinLength,
} from 'class-validator';
import { Role } from '../enums/role.enum';

export class UserDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  readonly username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  readonly password: string;

  @IsArray()
  @IsEnum(Role, { each: true })
  readonly roles?: Role[];
}
