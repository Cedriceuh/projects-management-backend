import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import * as request from 'supertest';
import { Model, Types } from 'mongoose';
import { TestSetupModule } from './test-setup.module';
import { UsersService } from '../src/users/users.service';
import { Project } from '../src/projects/schemas/project.schema';
import { AuthService } from '../src/auth/auth.service';
import { UserDto } from '../src/users/dtos/user.dto';
import { ProjectsModule } from '../src/projects/projects.module';
import { ProjectsService } from '../src/projects/projects.service';
import { TaskStatus } from '../src/projects/enums/task-status.enum';
import { Task } from '../src/projects/schemas/task.schema';

describe('ProjectsController (e2e)', () => {
  let app: INestApplication;
  let projectModel: Model<Project>;
  let taskModel: Model<Task>;
  let projectsService: ProjectsService;
  let usersService: UsersService;

  let user: UserDto;
  let userToken: string;

  const username = 'testuser';
  const password = 'testpassword';
  const name = 'test';
  const description = 'testdescription';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestSetupModule, ProjectsModule],
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

    const authService = app.get<AuthService>(AuthService);
    projectsService = app.get<ProjectsService>(ProjectsService);
    projectModel = app.get(getModelToken(Project.name));
    taskModel = app.get(getModelToken(Task.name));
    usersService = app.get<UsersService>(UsersService);

    user = await usersService.createUser(username, password);
    const { access_token } = await authService.signIn(username, password);
    userToken = access_token;
  });

  afterEach(async () => {
    await projectModel.deleteMany({});
    await taskModel.deleteMany({});
  });

  afterAll(async () => {
    await usersService.deleteById(user.id);
    await app.close();
  });

  describe('should be accessible for authenticated users only', () => {
    it('POST /projects', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .send({ name, description })
        .expect(401);

      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name, description })
        .expect(201);
    });

    it('GET /projects', async () => {
      await request(app.getHttpServer()).get('/projects').expect(401);

      await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it('GET /projects/:id', async () => {
      const project = await projectsService.create(user.id, name, description);

      await request(app.getHttpServer())
        .get(`/projects/${project.id}`)
        .expect(401);

      await request(app.getHttpServer())
        .get(`/projects/${project.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it('PATCH /projects/:id', async () => {
      const project = await projectsService.create(user.id, name, description);

      await request(app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .send({ name, description })
        .expect(401);

      await request(app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name, description })
        .expect(204);
    });

    it('DELETE /projects/:id', async () => {
      const project = await projectsService.create(user.id, name, description);

      await request(app.getHttpServer())
        .delete(`/projects/${project.id}`)
        .expect(401);

      await request(app.getHttpServer())
        .delete(`/projects/${project.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);
    });

    it('POST /projects/:id/tasks', async () => {
      const project = await projectsService.create(user.id, name, description);

      await request(app.getHttpServer())
        .post(`/projects/${project.id}/tasks`)
        .send({ name, description, status: 'TODO' })
        .expect(401);

      await request(app.getHttpServer())
        .post(`/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name, description, status: 'TODO' })
        .expect(201);
    });

    it('PATCH /projects/:id/tasks/:taskId', async () => {
      let project = await projectsService.create(user.id, name, description);
      project = await projectsService.addTask(project.id, {
        name,
        description,
        status: TaskStatus.TODO,
      });
      const taskId = project.tasks[0].id;

      await request(app.getHttpServer())
        .patch(`/projects/${project.id}/tasks/${taskId}`)
        .send({ status: TaskStatus.DONE })
        .expect(401);

      await request(app.getHttpServer())
        .patch(`/projects/${project.id}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: TaskStatus.DONE })
        .expect(204);
    });

    it('DELETE /projects/:id/tasks/:taskId', async () => {
      let project = await projectsService.create(user.id, name, description);
      project = await projectsService.addTask(project.id, {
        name,
        description,
        status: TaskStatus.TODO,
      });
      const taskId = project.tasks[0].id;

      await request(app.getHttpServer())
        .delete(`/projects/${project.id}/tasks/${taskId}`)
        .expect(401);

      await request(app.getHttpServer())
        .delete(`/projects/${project.id}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);
    });
  });

  describe('creates a new project', () => {
    it('successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name, description })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toEqual(
        await projectsService.getById(response.body.id),
      );
    });

    describe('throws an error when parameters are invalid', () => {
      it('when name is missing', async () => {
        await request(app.getHttpServer())
          .post('/projects')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            description,
          })
          .expect(400);
      });

      it('when description is missing', async () => {
        await request(app.getHttpServer())
          .post('/projects')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            name,
          })
          .expect(400);
      });

      it('when name is too short', async () => {
        await request(app.getHttpServer())
          .post('/projects')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            name: 'a',
            description,
          })
          .expect(400);
      });
    });
  });

  describe('returns a project data', () => {
    it('successfully', async () => {
      const project = await projectsService.create(user.id, name, description);

      const response = await request(app.getHttpServer())
        .get(`/projects/${project.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(project);
    });

    it('throws an error when project is not found', async () => {
      const id = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .get(`/projects/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('returns projects data', () => {
    it('successfully', async () => {
      await projectsService.create(user.id, name, description);

      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(await projectsService.getAll());
    });

    describe('throws an error when parameters are invalid', () => {
      it('size is not a number', async () => {
        await request(app.getHttpServer())
          .get('/projects')
          .set('Authorization', `Bearer ${userToken}`)
          .query({ size: 'notANumber' })
          .expect(400);
      });

      it('size is less than 1', async () => {
        await request(app.getHttpServer())
          .get('/projects')
          .set('Authorization', `Bearer ${userToken}`)
          .query({ size: 0 })
          .expect(400);
      });

      it('from is not a number', async () => {
        await request(app.getHttpServer())
          .get('/projects')
          .set('Authorization', `Bearer ${userToken}`)
          .query({ from: 'notANumber' })
          .expect(400);
      });

      it('from is less than 0', async () => {
        await request(app.getHttpServer())
          .get('/projects')
          .set('Authorization', `Bearer ${userToken}`)
          .query({ from: -1 })
          .expect(400);
      });
    });
  });

  describe('updates a project', () => {
    it('successfully', async () => {
      const project = await projectsService.create(user.id, name, description);

      await request(app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'updatedproject',
          description: 'updateddescription',
        })
        .expect(204);

      expect(await projectsService.getById(project.id)).toEqual({
        id: project.id,
        name: 'updatedproject',
        description: 'updateddescription',
        creatorId: user.id,
        tasks: [],
      });
    });

    it('throws an error when project is not found', async () => {
      const id = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .patch(`/projects/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'updatedproject',
          description: 'updateddescription',
        })
        .expect(404);
    });

    describe('throws an error when parameters are invalid', () => {
      it('when name is too short', async () => {
        const project = await projectsService.create(
          user.id,
          name,
          description,
        );

        await request(app.getHttpServer())
          .patch(`/projects/${project.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            name: 'a',
            description: 'updateddescription',
          })
          .expect(400);
      });
    });
  });

  describe('deletes a project', () => {
    it('successfully', async () => {
      const project = await projectsService.create(user.id, name, description);

      await request(app.getHttpServer())
        .delete(`/projects/${project.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);

      expect(await projectsService.getById(project.id)).toBeNull();
    });

    it('with all associated tasks', async () => {
      let project = await projectsService.create(user.id, name, description);
      project = await projectsService.addTask(project.id, {
        name,
        description,
        status: TaskStatus.TODO,
      });

      await request(app.getHttpServer())
        .delete(`/projects/${project.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);

      expect(await taskModel.find({})).toHaveLength(0);
    });

    it('throws an error when project is not found', async () => {
      const id = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .delete(`/projects/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('adds a task to a project', () => {
    it('successfully', async () => {
      const project = await projectsService.create(user.id, name, description);

      const response = await request(app.getHttpServer())
        .post(`/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'testtask',
          description: 'testdescription',
          status: 'TODO',
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toEqual(await projectsService.getById(project.id));
    });

    it('throws an error when project is not found', async () => {
      const id = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .post(`/projects/${id}/tasks`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'testtask',
          description: 'testdescription',
          status: 'TODO',
        })
        .expect(404);
    });

    describe('throws an error when parameters are invalid', () => {
      it('when name is missing', async () => {
        const project = await projectsService.create(
          user.id,
          name,
          description,
        );

        await request(app.getHttpServer())
          .post(`/projects/${project.id}/tasks`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            description: 'testdescription',
          })
          .expect(400);
      });

      it('when description is missing', async () => {
        const project = await projectsService.create(
          user.id,
          name,
          description,
        );

        await request(app.getHttpServer())
          .post(`/projects/${project.id}/tasks`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            name: 'testtask',
          })
          .expect(400);
      });

      it('when name is too short', async () => {
        const project = await projectsService.create(
          user.id,
          name,
          description,
        );

        await request(app.getHttpServer())
          .post(`/projects/${project.id}/tasks`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            name: 'a',
            description: 'testdescription',
          })
          .expect(400);
      });

      it('when status is invalid', async () => {
        const project = await projectsService.create(
          user.id,
          name,
          description,
        );

        await request(app.getHttpServer())
          .post(`/projects/${project.id}/tasks`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            name: 'testtask',
            description: 'testdescription',
            status: 'INVALID',
          })
          .expect(400);
      });
    });
  });

  describe('updates a task status', () => {
    it('successfully', async () => {
      let project = await projectsService.create(user.id, name, description);
      project = await projectsService.addTask(project.id, {
        name: 'testtask',
        description: 'testdescription',
        status: TaskStatus.TODO,
      });
      const taskId = project.tasks[0].id;

      await request(app.getHttpServer())
        .patch(`/projects/${project.id}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: TaskStatus.DONE,
        })
        .expect(204);

      expect(
        (await projectsService.getById(project.id)).tasks[0].status,
      ).toEqual(TaskStatus.DONE);
    });

    it('throws an error when project is not found', async () => {
      const id = new Types.ObjectId().toString();
      const task = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .patch(`/projects/${id}/tasks/${task}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'DONE',
        })
        .expect(404);
    });

    it('throws an error when task is not found', async () => {
      const project = await projectsService.create(user.id, name, description);
      const id = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .patch(`/projects/${project.id}/tasks/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'DONE',
        })
        .expect(404);
    });

    describe('throws an error when parameters are invalid', () => {
      it('when status is invalid', async () => {
        let project = await projectsService.create(user.id, name, description);
        project = await projectsService.addTask(project.id, {
          name: 'testtask',
          description: 'testdescription',
          status: TaskStatus.TODO,
        });
        const taskId = project.tasks[0].id;

        await request(app.getHttpServer())
          .patch(`/projects/${project.id}/tasks/${taskId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            status: 'hihujbnh',
          })
          .expect(400);
      });
    });
  });

  describe('deletes a task', () => {
    it('successfully', async () => {
      let project = await projectsService.create(user.id, name, description);
      project = await projectsService.addTask(project.id, {
        name: 'testtask',
        description: 'testdescription',
        status: TaskStatus.TODO,
      });
      const taskId = project.tasks[0].id;

      await request(app.getHttpServer())
        .delete(`/projects/${project.id}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);
    });

    it('throws an error when task is not found', async () => {
      const project = await projectsService.create(user.id, name, description);
      const id = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .delete(`/projects/${project.id}/tasks/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });
});
