import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserDto } from '../users/dtos/user.dto';

const mockUsersService = {
  getByUsername: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  const username = 'testuser';
  const password = 'testpassword';
  const userObjectId = new Types.ObjectId();
  const userDto: UserDto = {
    id: userObjectId.toString(),
    username,
    password,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test',
        }),
      ],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return a JWT token when the credentials are valid', async () => {
      // @ts-ignore
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(mockUsersService, 'getByUsername').mockResolvedValue(userDto);

      const { access_token } = await service.signIn(username, password);

      expect(access_token).toBeDefined();
    });

    it('should return null when the user is not found', async () => {
      jest.spyOn(mockUsersService, 'getByUsername').mockResolvedValue(null);

      const result = await service.signIn(username, password);

      expect(result).toBeNull();
    });

    it('should return null when the credentials are invalid', async () => {
      // @ts-ignore
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      jest.spyOn(mockUsersService, 'getByUsername').mockResolvedValue(userDto);

      const result = await service.signIn(username, password);

      expect(result).toBeNull();
    });
  });
});
