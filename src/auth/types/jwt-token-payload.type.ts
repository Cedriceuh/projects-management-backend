import { Role } from '../../users/enums/role.enum';

export type JwtTokenPayload = {
  userId: string;
  username: string;
  roles: Role[];
};
