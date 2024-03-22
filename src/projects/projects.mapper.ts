import { ProjectDocument } from './schemas/project.schema';
import { ProjectDto } from './dtos/project.dto';
import { TaskDocument } from './schemas/task.schema';

export const toProjectDto = (projectDocument: ProjectDocument): ProjectDto => {
  return {
    id: projectDocument._id.toString(),
    name: projectDocument.name,
    description: projectDocument.description,
    creatorId: projectDocument.creatorId.toString(),
    tasks: !projectDocument.tasks
      ? []
      : projectDocument.tasks.map((task: TaskDocument) => ({
          id: task._id.toString(),
          name: task.name,
          description: task.description,
          status: task.status,
        })),
  };
};
