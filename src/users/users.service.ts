import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { UserDto } from './dtos/user.dto';
import { toUserDto } from './users.mapper';
import { Role } from './enums/role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getAll(from: number = 0, size: number = 25): Promise<UserDto[]> {
    const userDocuments = await this.userModel
      .find()
      .skip(from)
      .limit(size)
      .exec();

    return userDocuments.map((userDocument) => toUserDto(userDocument));
  }

  async getById(id: string): Promise<UserDto | null> {
    const userDocument = await this.userModel.findById(id);
    if (!userDocument) {
      return null;
    }

    return toUserDto(userDocument);
  }

  async getByUsername(username: string): Promise<UserDto | null> {
    const userDocument = await this.userModel.findOne({ username });
    if (!userDocument) {
      return null;
    }

    return toUserDto(userDocument);
  }

  async createAdmin(username: string, password: string): Promise<UserDto> {
    return this.createUser(username, password, Role.ADMIN);
  }

  async createUser(
    username: string,
    password: string,
    role: Role = Role.USER,
  ): Promise<UserDto> {
    const existingUser = await this.getByUsername(username);
    if (existingUser) {
      throw new Error('Username already taken');
    }

    const userDocument = await this.userModel.create({
      username,
      password: password,
      roles: [role],
    });

    return toUserDto(userDocument);
  }

  async updateById(id: string, updateBody: Partial<UserDto>): Promise<boolean> {
    const userDocument = await this.userModel.findById(id);
    if (!userDocument) {
      return false;
    }

    if (updateBody.username) userDocument.username = updateBody.username;
    if (updateBody.password) userDocument.password = updateBody.password;

    await userDocument.save();

    return true;
  }

  async deleteById(id: string): Promise<boolean> {
    const deletedUserDocument = await this.userModel.findByIdAndDelete(id);
    if (!deletedUserDocument) {
      return false;
    }

    return true;
  }
}
