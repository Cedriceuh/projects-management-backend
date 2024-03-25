import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { toProjectDto } from './projects.mapper';
import { ProjectDto } from './dtos/project.dto';
import { CreateTaskDto } from './dtos/create-task.dto';
import { Project } from './schemas/project.schema';
import { Task } from './schemas/task.schema';
import { TaskStatus } from './enums/task-status.enum';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
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
      .populate('tasks')
      .skip(from)
      .limit(size)
      .exec();

    return projectDocuments.map((projectDocument) =>
      toProjectDto(projectDocument),
    );
  }

  async getById(id: string): Promise<ProjectDto | null> {
    const projectDocument = await this.projectModel
      .findById(id)
      .populate('tasks');
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

    const taskIds = projectDocument.tasks
      ? projectDocument.tasks.map((task) => task._id)
      : [];
    if (taskIds.length > 0) {
      await this.taskModel.deleteMany({ _id: { $in: taskIds } });
    }

    return true;
  }

  async addTask(
    projectId: string,
    createTaskDto: CreateTaskDto,
  ): Promise<ProjectDto | null> {
    const projectDocument = await this.projectModel
      .findById(projectId)
      .populate('tasks');
    if (!projectDocument) {
      return null;
    }

    const taskDocument = await this.taskModel.create(createTaskDto);
    projectDocument.tasks.push(taskDocument);
    const updatedProjectDocument = await projectDocument.save();

    return toProjectDto(updatedProjectDocument);
  }

  async deleteTask(projectId: string, taskId: string): Promise<boolean> {
    const taskDocument = await this.taskModel.findByIdAndDelete(taskId);
    if (!taskDocument) {
      return false;
    }

    const projectDocument = await this.projectModel.findById(projectId);
    if (projectDocument) {
      projectDocument.tasks = projectDocument.tasks.filter(
        (task) => task._id.toString() !== taskId,
      );
      await projectDocument.save();
    }

    return true;
  }

  async updateTaskStatus(
    taskId: string,
    taskStatus: TaskStatus,
  ): Promise<boolean> {
    const taskDocument = await this.taskModel.findByIdAndUpdate(taskId, {
      status: taskStatus,
    });
    if (!taskDocument) {
      return false;
    }

    return true;
  }
}
