import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import * as request from 'supertest';
import { Model, Types } from 'mongoose';
import { TestSetupModule } from './test-setup.module';
import { UsersService } from '../src/users/users.service';
import * as process from 'process';
import { User } from '../src/users/schemas/user.schema';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let usersService: UsersService;
  let adminToken: string;

  const username = 'testuser';
  const password = 'testpassword';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestSetupModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
      });

    adminToken = response.body.access_token;
    usersService = app.get<UsersService>(UsersService);
    userModel = app.get(getModelToken(User.name));
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('should be accessible for admin users only', () => {
    let userId: string;
    let userToken: string;

    beforeEach(async () => {
      const user = await usersService.createUser(username, password);
      userId = user.id;

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username, password });

      userToken = response.body.access_token;
    });

    it('POST /users', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({ username: 'username', password: 'password' })
        .expect(401);

      await request(app.getHttpServer())
        .post('/users')
        .send({ username: 'username', password: 'password' })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .post('/users')
        .send({ username: 'username', password: 'password' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);
    });

    it('GET /users', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);

      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /users/:id', async () => {
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .send({ id: userId })
        .expect(401);

      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .send({ id: userId })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .send({ id: userId })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('PATCH /users/:id', async () => {
      await request(app.getHttpServer()).patch(`/users/${userId}`).expect(401);

      await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('DELETE /users/:id', async () => {
      await request(app.getHttpServer()).delete(`/users/${userId}`).expect(401);

      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });
  });

  describe('creates a new user', () => {
    it('successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username, password })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toEqual(await usersService.getByUsername(username));
    });

    it('throws an error when username is already taken', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username, password })
        .expect(201);

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username, password })
        .expect(400);
    });

    describe('throws an error when parameters are invalid', () => {
      it('username is too short', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ username: 'a', password: 'password' })
          .expect(400);
      });

      it('password is too short', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ username: 'username', password: 'b' })
          .expect(400);
      });

      it('username is missing', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ password: 'password' })
          .expect(400);
      });

      it('password is missing', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ username: 'username' })
          .expect(400);
      });
    });
  });

  describe('returns a user data', () => {
    it('successfully', async () => {
      const createUserResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username, password });
      const createdUser = createUserResponse.body;

      const response = await request(app.getHttpServer())
        .get(`/users/${createdUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(await usersService.getById(createdUser.id));
    });

    it('throws an error when user is not found', async () => {
      const id = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('returns users data', () => {
    it('successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(await usersService.getAll());
    });

    describe('throws an error when query parameters are invalid', () => {
      it('size is not a number', async () => {
        await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ size: 'notANumber' })
          .expect(400);
      });

      it('size is less than 1', async () => {
        await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ size: 0 })
          .expect(400);
      });

      it('from is not a number', async () => {
        await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ from: 'notANumber' })
          .expect(400);
      });

      it('from is less than 0', async () => {
        await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ from: -1 })
          .expect(400);
      });
    });
  });

  describe('updates a user', () => {
    const newUsername = 'newUsername';
    const newPassword = 'newPassword';

    it('successfully', async () => {
      const createUserResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username, password });
      const createdUser = createUserResponse.body;

      await request(app.getHttpServer())
        .patch(`/users/${createdUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: newUsername, password: newPassword })
        .expect(204);

      const updatedUser = await usersService.getById(createdUser.id);

      expect(updatedUser.username).toBe(newUsername);
      expect(updatedUser.password).not.toBe(password);
      expect(updatedUser.password).not.toBe(newPassword);
    });

    it('throws an error when updating a not found user', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${new Types.ObjectId().toString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: newUsername, password: newPassword })
        .expect(404);
    });

    it('throws an error when updating a user with an invalid userId', async () => {
      const invalidUserId = 'someWrongId';
      await request(app.getHttpServer())
        .patch(`/users/${invalidUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: newUsername, password: newPassword })
        .expect(400);
    });

    describe('throws an error when parameters are invalid', () => {
      it('when username is too short', async () => {
        const createUserResponse = await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ username, password });
        const createdUser = createUserResponse.body;

        await request(app.getHttpServer())
          .patch(`/users/${createdUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ username: 'a' })
          .expect(400);
      });

      it('when password is too short', async () => {
        const createUserResponse = await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ username, password });
        const createdUser = createUserResponse.body;

        await request(app.getHttpServer())
          .patch(`/users/${createdUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ password: 'a' })
          .expect(400);
      });
    });
  });

  describe('deletes a user', () => {
    it('successfully', async () => {
      const user = await usersService.createUser(username, password);

      await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      expect(await usersService.getById(user.id)).toBeNull();
    });

    it('throws an error when user is not found', async () => {
      const id = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .delete(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
