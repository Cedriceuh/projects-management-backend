import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TestSetupModule } from './test-setup.module';
import * as process from 'process';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a JWT token when the credentials are valid', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response?.body?.access_token).toBeDefined();
  });

  it('throws an error when the credentials are invalid', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'invalid',
        password: 'invalid',
      })
      .expect('Content-Type', /json/)
      .expect(400);
  });
});
