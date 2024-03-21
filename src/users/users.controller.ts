import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/roles.guard';
import { GetUsersDto } from './dtos/get-users.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';

@Controller('users')
@Roles(Role.ADMIN)
@UseGuards(AuthGuard, RoleGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Query() getUsersDto: GetUsersDto) {
    const { from, size } = getUsersDto;

    return await this.usersService.getAll(from, size);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    let userDto: UserDto | null;
    try {
      userDto = await this.usersService.getById(id);
    } catch (e) {
      throw new BadRequestException();
    }

    if (!userDto) {
      throw new NotFoundException();
    }

    return userDto;
  }

  @Post()
  async postUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.createUser(
        createUserDto.username,
        createUserDto.password,
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id')
  async patchUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    let isUpdated: boolean;
    try {
      isUpdated = await this.usersService.updateById(id, updateUserDto);
    } catch (e) {
      throw new BadRequestException();
    }

    if (!isUpdated) {
      throw new NotFoundException();
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    let isDeleted: boolean;
    try {
      isDeleted = await this.usersService.deleteById(id);
    } catch (e) {
      throw new BadRequestException();
    }

    if (!isDeleted) {
      throw new NotFoundException();
    }
  }
}
