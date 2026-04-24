import {Task as PrismaTask, TaskImage as PrismaTaskImage} from "@prisma/client";
import {Task, TaskImage} from '../../../shared/types'
import { IMapper } from "./Mapper.interface";

export class TaskMapper implements IMapper<Task, PrismaTask>{
  toDomain(prismaTask: PrismaTask & { images?: PrismaTaskImage[] }): Task {
    return {
      id: prismaTask.id,
      title: prismaTask.title,
      description: prismaTask.description ?? '',
      startDate: prismaTask.startDate.toISOString(),
      endDate: prismaTask.endDate?.toISOString(),
      tag: prismaTask.tag,
      order: prismaTask.order,

      images: prismaTask.images?.map((image) => this.mapImageToDomain(image)) ?? [],
    };
  }

  toDomainMany(prismaTasks: PrismaTask[]): Task[] {
    return prismaTasks.map(task => this.toDomain(task));
  }

  private mapImageToDomain(prismaImage: PrismaTaskImage): TaskImage {
    return {
      id: prismaImage.id,
      taskId: prismaImage.taskId ?? -1,
      filename: prismaImage.filename,
      storedName: prismaImage.storedName,
      mimetype: prismaImage.mimetype,
      size: prismaImage.size,
      width: prismaImage.width,
      height: prismaImage.height,
      url: prismaImage.url,
      thumbnailUrl: prismaImage.thumbnailUrl ?? undefined,
      order: prismaImage.order,
      createdAt: prismaImage.createdAt.toISOString(),
      updatedAt: prismaImage.updatedAt.toISOString(),
    };
  }
}

