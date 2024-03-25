import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtTokenPayload } from '../auth/types/jwt-token-payload.type';
import { Role } from '../users/enums/role.enum';
import { Request } from 'express';
import { TaskStatus } from './enums/task-status.enum';

const mockService = {
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
  addTask: jest.fn(),
  deleteTask: jest.fn(),
  updateTaskStatus: jest.fn(),
};

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let projectsService: ProjectsService;

  const name = 'test';
  const description = 'testdescription';
  const projectObjectId = new Types.ObjectId();

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
          provide: ProjectsService,
          useValue: mockService,
        },
      ],
      controllers: [ProjectsController],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    projectsService = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProject', () => {
    it('should throw a not found exception when project is not found', async () => {
      jest.spyOn(projectsService, 'getById').mockResolvedValue(null);

      await expect(
        controller.getProject(projectObjectId.toString()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('postProject', () => {
    it('should throw a bad request exception when project creation fails', async () => {
      const token: JwtTokenPayload = {
        userId: new Types.ObjectId().toString(),
        username: '',
        roles: [Role.USER],
      };
      const mockRequest = {
        token,
      } as unknown as Request;
      jest.spyOn(projectsService, 'create').mockRejectedValue(new Error());

      await expect(
        controller.postProject(mockRequest, { name, description }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('updateProject', () => {
    it('should throw a not found exception when project is not found', async () => {
      jest.spyOn(projectsService, 'updateById').mockResolvedValue(false);

      await expect(
        controller.patchProject(projectObjectId.toString(), {
          name,
          description,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('deleteProject', () => {
    it('should throw a not found exception when project is not found', async () => {
      jest.spyOn(projectsService, 'deleteById').mockResolvedValue(false);

      await expect(
        controller.deleteProject(projectObjectId.toString()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('postTask', () => {
    it('should throw a not found exception when project is not found', async () => {
      jest.spyOn(projectsService, 'addTask').mockResolvedValue(null);

      await expect(
        controller.postTask(projectObjectId.toString(), {
          name,
          description,
          status: TaskStatus.TODO,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateTaskStatus', () => {
    it('should throw a not found exception when task is not found', async () => {
      jest.spyOn(projectsService, 'updateTaskStatus').mockResolvedValue(false);

      await expect(
        controller.patchTask(
          projectObjectId.toString(),
          new Types.ObjectId().toString(),
          { status: TaskStatus.DONE },
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('deleteTask', () => {
    it('should throw a not found exception when task is not found', async () => {
      jest.spyOn(projectsService, 'deleteTask').mockResolvedValue(false);

      await expect(
        controller.deleteTask(
          projectObjectId.toString(),
          new Types.ObjectId().toString(),
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
