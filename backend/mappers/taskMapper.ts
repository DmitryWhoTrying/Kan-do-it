import {Task as PrismaTask} from "../generated/prisma/client.ts"
import {Task} from '../../shared/types.ts'
import { IMapper } from "./mapper.interface.ts";

export class TaskMapper implements IMapper<Task, PrismaTask>{
  toDomain(prismaTask: PrismaTask): Task {
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

  toDomainMany(prismaTasks: PrismaTask[]): Task[] {
    return prismaTasks.map(task => this.toDomain(task));
  }
}

