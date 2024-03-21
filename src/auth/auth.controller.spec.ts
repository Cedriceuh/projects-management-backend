import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

const mockService = {
  signIn: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const username = 'testuser';
  const password = 'testpassword';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [
        JwtModule.register({
          secret: 'test',
        }),
      ],
      providers: [
        AuthService,
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should throw an exception when the credentials are valid', async () => {
      jest.spyOn(authService, 'signIn').mockResolvedValue(null);

      await expect(
        controller.login({ username, password }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
