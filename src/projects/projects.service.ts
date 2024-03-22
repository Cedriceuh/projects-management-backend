import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from './schemas/project.schema';
import { toProjectDto } from './projects.mapper';
import { ProjectDto } from './dtos/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async create(
    creatorId: string,
    name: string,
    description: string,
  ): Promise<ProjectDto> {
    const projectDocument = await this.projectModel.create({
      creatorId,
      name,
      description,
    });

    return toProjectDto(projectDocument);
  }

  async getAll(from: number = 0, size: number = 25): Promise<ProjectDto[]> {
    const projectDocuments = await this.projectModel
      .find()
      .skip(from)
      .limit(size)
      .exec();

    return projectDocuments.map((projectDocument) =>
      toProjectDto(projectDocument),
    );
  }

  async getById(id: string): Promise<ProjectDto | null> {
    const projectDocument = await this.projectModel.findById(id);
    if (!projectDocument) {
      return null;
    }

    return toProjectDto(projectDocument);
  }

  async updateById(
    id: string,
    updateBody: Partial<ProjectDto>,
  ): Promise<boolean> {
    const projectDocument = await this.projectModel.findByIdAndUpdate(
      id,
      updateBody,
    );
    if (!projectDocument) {
      return false;
    }

    return true;
  }

  async deleteById(id: string): Promise<boolean> {
    const projectDocument = await this.projectModel.findByIdAndDelete(id);
    if (!projectDocument) {
      return false;
    }

    return true;
  }
}
