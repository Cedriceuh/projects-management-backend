import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dtos/create-project.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/roles.guard';
import { ProjectDto } from './dtos/project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { GetProjectsDto } from './dtos/get-projects.dto';

@Controller('projects')
@Roles(Role.USER)
@UseGuards(AuthGuard, RoleGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async getProjects(@Query() getProjectsDto: GetProjectsDto) {
    const { from, size } = getProjectsDto;

    return await this.projectsService.getAll(from, size);
  }

  @Get(':id')
  async getProject(@Param('id') id: string) {
    let projectDto: ProjectDto | null;
    try {
      projectDto = await this.projectsService.getById(id);
    } catch (e) {
      throw new BadRequestException();
    }

    if (!projectDto) {
      throw new NotFoundException();
    }

    return projectDto;
  }

  @Post()
  async postProject(
    @Req() request: Request,
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ProjectDto> {
    const token = request.token;
    if (!request?.token?.userId) {
      throw new UnauthorizedException();
    }

    const { userId: creatorId } = token;
    const { name, description } = createProjectDto;

    try {
      return await this.projectsService.create(creatorId, name, description);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id')
  async patchProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    let isUpdated: boolean;
    try {
      isUpdated = await this.projectsService.updateById(id, updateProjectDto);
    } catch (e) {
      throw new BadRequestException();
    }

    if (!isUpdated) {
      throw new NotFoundException();
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteProject(@Param('id') id: string) {
    let isDeleted: boolean;
    try {
      isDeleted = await this.projectsService.deleteById(id);
    } catch (e) {
      throw new BadRequestException();
    }

    if (!isDeleted) {
      throw new NotFoundException();
    }
  }
}
