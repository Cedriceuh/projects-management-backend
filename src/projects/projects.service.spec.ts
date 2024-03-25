import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { Model, Query, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { getModelToken } from '@nestjs/mongoose';
import { CreateTaskDto } from './dtos/create-task.dto';
import { TaskStatus } from './enums/task-status.enum';
import { Task, TaskDocument } from './schemas/task.schema';
import { ProjectDto } from './dtos/project.dto';

const mockModel = {
  create: jest.fn(),
  findById: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectModel: Partial<Model<Project>>;
  let taskModel: Partial<Model<Task>>;

  const name = 'test';
  const description = 'testdescription';
  const creatorObjectId = new Types.ObjectId();
  const projectObjectId = new Types.ObjectId();
  const projectDocument: Partial<ProjectDocument> = {
    _id: projectObjectId,
    name,
    description,
    creatorId: creatorObjectId,
    tasks: [],
    save: jest.fn(),
  };
  const projectDto: ProjectDto = {
    id: projectObjectId.toString(),
    name,
    description,
    creatorId: creatorObjectId.toString(),
    tasks: [],
  };
  const taskObjectId = new Types.ObjectId();
  const taskDocument: Partial<TaskDocument> = {
    _id: taskObjectId,
    name,
    description,
    status: TaskStatus.TODO,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken(Project.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(Task.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectModel = module.get<Model<Project>>(getModelToken(Project.name));
    taskModel = module.get<Model<Task>>(getModelToken(Task.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of project DTOs', async () => {
      jest.spyOn(projectModel, 'find').mockImplementation(() => {
        const query: Query<ProjectDocument[], ProjectDocument> = new Query();
        query.skip = jest.fn().mockReturnThis();
        query.limit = jest.fn().mockReturnThis();
        query.exec = jest.fn().mockResolvedValue([projectDocument]);
        return query;
      });

      const result = await service.getAll();

      expect(result).toEqual([projectDto]);
    });

    it('should return an empty array when there are no projects', async () => {
      jest.spyOn(projectModel, 'find').mockImplementation(() => {
        const query: Query<ProjectDocument[], ProjectDocument> = new Query();
        query.skip = jest.fn().mockReturnThis();
        query.limit = jest.fn().mockReturnThis();
        query.exec = jest.fn().mockResolvedValue([]);
        return query;
      });

      const result = await service.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return a project DTO', async () => {
      // @ts-ignore
      jest.spyOn(projectModel, 'populate').mockResolvedValue(projectDocument);

      const result = await service.getById(projectObjectId.toString());

      expect(result).toEqual(projectDto);
    });

    it('should return null when project is not found', async () => {
      jest.spyOn(projectModel, 'populate').mockResolvedValue(null);

      const result = await service.getById(projectObjectId.toString());

      expect(result).toBeNull();
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      // @ts-ignore
      jest.spyOn(projectModel, 'create').mockResolvedValue(projectDocument);

      const result = await service.create(
        creatorObjectId.toString(),
        name,
        description,
      );

      expect(result).toEqual(projectDto);
    });
  });

  describe('deleteById', () => {
    it('should return true when project is deleted', async () => {
      jest.spyOn(projectModel, 'findByIdAndDelete').mockResolvedValue(true);

      const result = await service.deleteById(projectObjectId.toString());

      expect(result).toBe(true);
    });

    it('should return false when project is not found', async () => {
      jest.spyOn(projectModel, 'findByIdAndDelete').mockResolvedValue(false);

      const result = await service.deleteById(projectObjectId.toString());

      expect(result).toBe(false);
    });
  });

  describe('updateById', () => {
    it('should return true when project is updated', async () => {
      jest
        .spyOn(projectModel, 'findByIdAndUpdate')
        .mockResolvedValue(projectDocument);

      const result = await service.updateById(projectObjectId.toString(), {
        name,
      });

      expect(result).toBe(true);
    });

    it('should return false when project is not found', async () => {
      jest.spyOn(projectModel, 'findByIdAndUpdate').mockResolvedValue(null);

      const result = await service.updateById(projectObjectId.toString(), {
        name,
      });

      expect(result).toBe(false);
    });
  });

  describe('addTask', () => {
    const createTaskDto: CreateTaskDto = {
      name,
      description,
      status: TaskStatus.TODO,
    };

    it('should return a project DTO when task is added', async () => {
      // @ts-ignore
      jest.spyOn(taskModel, 'create').mockResolvedValue(taskDocument);
      // @ts-ignore
      jest.spyOn(projectModel, 'populate').mockResolvedValue(projectDocument);
      jest.spyOn(projectDocument, 'save').mockResolvedValue({
        ...projectDocument,
        // @ts-ignore
        tasks: [taskDocument],
      });

      const result = await service.addTask(
        projectObjectId.toString(),
        createTaskDto,
      );

      expect(result).toEqual({
        ...projectDto,
        tasks: [{ id: taskObjectId.toString(), ...createTaskDto }],
      });
    });

    it('should return null when project is not found', async () => {
      jest.spyOn(projectModel, 'populate').mockResolvedValue(null);

      const result = await service.addTask(
        projectObjectId.toString(),
        createTaskDto,
      );

      expect(result).toBe(null);
    });
  });

  describe('deleteTask', () => {
    it('should return true when task is deleted', async () => {
      jest
        .spyOn(taskModel, 'findByIdAndDelete')
        .mockResolvedValue(taskDocument);
      jest
        .spyOn(projectModel, 'findById')
        .mockResolvedValue({ ...projectDocument, tasks: [taskDocument] });
      // @ts-ignore
      jest.spyOn(projectDocument, 'save').mockResolvedValue({
        ...projectDocument,
        tasks: [],
      });

      const result = await service.deleteTask(
        projectObjectId.toString(),
        taskObjectId.toString(),
      );

      expect(result).toBe(true);
    });

    it('should return false when task is not found', async () => {
      jest.spyOn(projectModel, 'findByIdAndDelete').mockResolvedValue(null);

      const result = await service.deleteTask(
        projectObjectId.toString(),
        taskObjectId.toString(),
      );

      expect(result).toBe(false);
    });
  });

  describe('updateTaskStatus', () => {
    it('should return true when task status is updated', async () => {
      jest
        .spyOn(taskModel, 'findByIdAndUpdate')
        .mockResolvedValue({ ...taskDocument, status: TaskStatus.IN_PROGRESS });

      const result = await service.updateTaskStatus(
        taskObjectId.toString(),
        TaskStatus.IN_PROGRESS,
      );

      expect(result).toBe(true);
    });

    it('should return false when task is not found', async () => {
      jest.spyOn(taskModel, 'findByIdAndUpdate').mockResolvedValue(null);

      const result = await service.updateTaskStatus(
        taskObjectId.toString(),
        TaskStatus.IN_PROGRESS,
      );

      expect(result).toBe(false);
    });
  });
});
