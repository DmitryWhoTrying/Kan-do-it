import {Task as PrismaTask} from "../generated/prisma/client.ts"
import {Task} from '../../shared/types.ts'

export class TaskMapper {
  static toDomain(prismaTask: PrismaTask): Task {
    return {
      id: prismaTask.id,
      title: prismaTask.title,
      description: prismaTask.description ?? '',
      startDate: prismaTask.startDate.toISOString(),
      endDate: prismaTask.endDate?.toISOString(),
      tag: prismaTask.tag,
      order: prismaTask.order,
    };
  }

  static toDomainMany(prismaTasks: PrismaTask[]): Task[] {
    return prismaTasks.map(task => this.toDomain(task));
  }
}

