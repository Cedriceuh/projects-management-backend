import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

const mockService = {
  getAll: jest.fn(),
  getById: jest.fn(),
  createUser: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const username = 'testuser';
  const password = 'testpassword';
  const userObjectId = new Types.ObjectId();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test',
        }),
      ],
      providers: [
        JwtService,
        {
          provide: UsersService,
          useValue: mockService,
        },
      ],
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should throw a not found exception when user is not found', async () => {
      jest.spyOn(usersService, 'getById').mockResolvedValue(null);

      await expect(
        controller.getUser(userObjectId.toString()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('postUser', () => {
    it('should throw a bad request exception when username is already taken', async () => {
      jest.spyOn(usersService, 'createUser').mockRejectedValue(new Error());

      await expect(
        controller.postUser({ username, password }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('patchUser', () => {
    it('should throw a not found exception when user is not found', async () => {
      jest.spyOn(usersService, 'updateById').mockResolvedValue(false);

      await expect(
        controller.patchUser(userObjectId.toString(), { username }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should throw a not found exception when user is not found', async () => {
      jest.spyOn(usersService, 'deleteById').mockResolvedValue(false);

      await expect(
        controller.deleteUser(userObjectId.toString()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
