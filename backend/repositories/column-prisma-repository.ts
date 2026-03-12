import { Column } from "../../shared/types";
import { Prisma, PrismaClient } from "../generated/prisma/client";
import { ColumnMapper } from "../mappers/ColumnMapper";
import { IColumnRepository } from "./column-repository.interface";


export class ColumnPrismaRepository implements IColumnRepository{
    constructor(private prisma: PrismaClient){};

    async create(columns: Omit<Column, "id" | "createdAt">): Promise<Column> {
        throw new Error("Method not implemented.");
    }
    async update(columnID: number, data: Partial<Column>): Promise<Column | null> {
        const updateData: Prisma.ColumnUpdateInput={
            title: data.title,
            order: data.order ?? 0
        } 
        
        if (data.tasks){
            updateData.tasks = {
                deleteMany: {},
                create: data.tasks.map(task=>({
                    title: task.title,
                    description: task.description,
                    startDate: new Date(task.startDate),
                    endDate: task.endDate ? new Date(task.endDate) : null,
                    tag: task.tag ?? "",
                    order: task.order ?? 0,
                }))
            }
        }

        const prismaColumn = await this.prisma.column.update({
            where:{id: columnID},
            data: updateData,
            include:{
                tasks: true
            }
        });

        if (!prismaColumn)
            return null;

        return new ColumnMapper().toDomain(prismaColumn);
    }

    async delete(columnID: number): Promise<boolean> {
        const prismaColumn = await this.prisma.column.delete({
            where:{id: columnID},
            include: {tasks: true}
        })

        if (!prismaColumn)
            return false;

        return true;
    }
    async findAll(): Promise<Column[]> {
        const prismaColumns = await this.prisma.column.findMany({
            include:{
                tasks: true
            }
        });

        if (!prismaColumns)
            return [];

        return new ColumnMapper().toDomainMany(prismaColumns);
    }
}