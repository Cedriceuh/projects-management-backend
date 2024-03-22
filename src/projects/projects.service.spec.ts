import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { Model, Query, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { getModelToken } from '@nestjs/mongoose';

const mockModel = {
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectModel: Partial<Model<Project>>;

  const name = 'testproject';
  const description = 'testdescription';
  const creatorObjectId = new Types.ObjectId();
  const projectObjectId = new Types.ObjectId();
  const projectDocument: Partial<ProjectDocument> = {
    _id: projectObjectId,
    name,
    description,
    creatorId: creatorObjectId.toString(),
    tasks: [],
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken(Project.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectModel = module.get<Model<Project>>(getModelToken(Project.name));
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

      expect(result).toEqual([
        {
          id: projectObjectId.toString(),
          name,
          description,
          creatorId: creatorObjectId.toString(),
          tasks: [],
        },
      ]);
    });
  });

  describe('getById', () => {
    it('should return a project DTO', async () => {
      jest.spyOn(projectModel, 'findById').mockResolvedValue(projectDocument);

      const result = await service.getById(projectObjectId.toString());

      expect(result).toEqual({
        id: projectObjectId.toString(),
        name,
        description,
        creatorId: creatorObjectId.toString(),
        tasks: [],
      });
    });

    it('should return null when project is not found', async () => {
      jest.spyOn(projectModel, 'findById').mockResolvedValue(null);

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

      expect(result).toEqual({
        id: projectObjectId.toString(),
        name,
        description,
        creatorId: creatorObjectId.toString(),
        tasks: [],
      });
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
        name: 'newname',
      });

      expect(result).toBe(true);
    });

    it('should return false when project is not found', async () => {
      jest.spyOn(projectModel, 'findByIdAndUpdate').mockResolvedValue(null);

      const result = await service.updateById(projectObjectId.toString(), {
        name: 'newname',
      });

      expect(result).toBe(false);
    });
  });
});
