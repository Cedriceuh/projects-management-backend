import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { Model, Query, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UserDto } from './dtos/user.dto';
import { Role } from './enums/role.enum';

const mockModel = {
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Partial<Model<User>>;

  const username = 'test';
  const password = 'testpassword';
  const hashedPassword = bcrypt.hashSync(password);
  const userObjectId = new Types.ObjectId();
  const userDocument: Partial<UserDocument> = {
    _id: userObjectId,
    username,
    password: hashedPassword,
    roles: [],
    save: jest.fn(),
  };
  const userDto: UserDto = {
    id: userObjectId.toString(),
    username,
    password: hashedPassword,
    roles: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of user DTOs', async () => {
      jest.spyOn(userModel, 'find').mockImplementation(() => {
        const query = new Query<UserDocument[], UserDocument>();
        query.skip = jest.fn().mockReturnThis();
        query.limit = jest.fn().mockReturnThis();
        query.exec = jest.fn().mockResolvedValue([userDocument]);
        return query;
      });

      const users = await service.getAll(0, 1);

      expect(users).toEqual([userDto]);
    });

    it("should return an empty array when there isn't any user", async () => {
      jest.spyOn(userModel, 'find').mockImplementation(() => {
        const query = new Query<UserDocument[], UserDocument>();
        query.skip = jest.fn().mockReturnThis();
        query.limit = jest.fn().mockReturnThis();
        query.exec = jest.fn().mockResolvedValue([]);
        return query;
      });

      const users = await service.getAll();

      expect(users).toEqual([]);
    });
  });

  describe('getByUsername', () => {
    it('should return a user DTO by username', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(userDocument);

      const result = await service.getByUsername(username);

      expect(result).toEqual(userDto);
    });

    it('should return null when user is not found', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      const result = await service.getByUsername(username);

      expect(result).toBeNull();
    });
  });

  describe('getById', () => {
    it('should return a user DTO by id', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(userDocument);

      const result = await service.getById(userObjectId.toString());
      expect(result).toEqual(userDto);
    });

    it('should return null when user is not found', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(null);

      const result = await service.getById(userObjectId.toString());

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(userModel, 'create')
        // @ts-ignore
        .mockResolvedValue({ ...userDocument, roles: [Role.USER] });

      const result = await service.createUser(username, password);

      expect(result).toEqual({ ...userDto, roles: [Role.USER] });
    });

    it('should throw an error when given username is already used', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(userDocument);

      await expect(() =>
        service.createUser(username, password),
      ).rejects.toThrow();
    });
  });

  describe('createAdmin', () => {
    it('should create a new admin user', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(userModel, 'create')
        // @ts-ignore
        .mockResolvedValue({ ...userDocument, roles: [Role.ADMIN] });

      const result = await service.createAdmin(username, password);

      expect(result).toEqual({ ...userDto, roles: [Role.ADMIN] });
    });
  });

  describe('deleteById', () => {
    it('should delete a user by id', async () => {
      jest
        .spyOn(userModel, 'findByIdAndDelete')
        .mockResolvedValue(userDocument);

      const result = await service.deleteById(userObjectId.toString());

      expect(result).toBe(true);
    });

    it('should not delete any user when provided id is not found', async () => {
      jest.spyOn(userModel, 'findByIdAndDelete').mockResolvedValue(null);

      const result = await service.deleteById('');

      expect(result).toBe(false);
    });
  });

  describe('updateById', () => {
    it('should return true when user is updated', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(userDocument);

      const result = await service.updateById(userObjectId.toString(), {
        username,
        password,
      });

      expect(result).toBe(true);
    });

    it('should return false when user is not found', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(null);

      const result = await service.updateById('', {});

      expect(result).toBe(false);
    });
  });
});
