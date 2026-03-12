import { Task } from "../../shared/types";
import { Prisma, PrismaClient } from "../generated/prisma/client";
import { TaskMapper } from "../mappers/taskMapper";
import { ITaskRepository } from "./task-repository.interface";


export class TaskPrismaRepository implements ITaskRepository{
    constructor(private prisma: PrismaClient){}

    async create(task: Omit<Task, "id" | "createdAt">, columnId: number): Promise<Task> {
        const prismaTask = await this.prisma.task.create({
            data:{
                title:  task.title,
                description: task.description,
                startDate: new Date(task.startDate),
                endDate: task.endDate ? new Date(task.endDate) : null,
                tag: task.tag ?? "",
                order:  task.order ?? 0,
                columnId:   columnId
            }
        })
        
        return new TaskMapper().toDomain(prismaTask);
    }

    async update(taskID: number, data: Partial<Task>, columnId: number): Promise<Task | null> {
        const updateData: Prisma.TaskUpdateInput={
        };

        if (data.title){
            updateData.title =  data.title;
        };
        if (data.description){
            updateData.description = data.description;
        };
        if (data.startDate){
            updateData.startDate = new Date(data.startDate);
        };
        if (data.endDate){
            updateData.endDate = data.endDate ? new Date(data.endDate) : null;
        };
        if (data.tag){
            updateData.tag = data.tag;
        };
        if (data.order){
            updateData.order = data.order;
        };

        const prismaTask = await this.prisma.task.update({
            where: {id: taskID},
            data: updateData,
            include:{
                Column: {where:
                    {id: columnId}
                }
            }
        });

        if (!prismaTask)
            return null;

        return new TaskMapper().toDomain(prismaTask);
    }
    async delete(taskID: number): Promise<boolean> {
        const prismaTask = await this.prisma.task.delete({
            where: {id: taskID}
        })

        if (!prismaTask)
            return false;

        return true;
    }
    async findAll(): Promise<Task[]> {
        const prismaTask = await this.prisma.task.findMany({})

        if (!prismaTask)
            return [];

        return  new TaskMapper().toDomainMany(prismaTask);
    }
    async find(taskID: number): Promise<Task | null> {
        const prismaTask = await this.prisma.task.findUnique(
            {
                where: {id: taskID}
            }
        )

        if (!prismaTask)
            return null;

        return new TaskMapper().toDomain(prismaTask);
    }
    
}