import { UserDocument } from './schemas/user.schema';
import { UserDto } from './dtos/user.dto';

export const toUserDto = (userDocument: UserDocument): UserDto => {
  return {
    id: userDocument._id.toString(),
    username: userDocument.username,
    password: userDocument.password,
    roles: userDocument.roles,
  };
};
