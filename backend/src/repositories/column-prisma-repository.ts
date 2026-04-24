import { Column } from "../../../shared/types";
import { Prisma, PrismaClient } from "@prisma/client";
import { ColumnMapper } from "../mappers/ColumnMapper";
import { IColumnRepository } from "./column-repository.interface";


export class PrismaColumnRepository implements IColumnRepository{
    constructor(private prisma: PrismaClient){}
    
    async findByBoard(boardID: number): Promise<Column[]> {
        const prismaColumns = await this.prisma.column.findMany({
        where: {
            boardId: boardID,
        },
        include: {
            tasks: {include: {images: true}, orderBy: {order: 'asc'}}
        },
        orderBy: {
            order: 'asc',
        }
    });

        if (!prismaColumns)
            return [];

        return new ColumnMapper().toDomainMany(prismaColumns);
    }
;

    async create(columns: Omit<Column, "id" | "createdAt">, boardId: number): Promise<Column> {
        const prismaColumn = await this.prisma.column.create({
            data:{
                title: columns.title,
                order: columns.order ?? 0,
                tasks: {create: columns.tasks.map(task=>({
                                title: task.title,
                                description: task.description,
                                startDate: new Date(task.startDate),
                                endDate: task.endDate ? new Date(task.endDate) : null,
                                tag: task.tag ?? "",
                                order: task.order ?? 0,
                            }))
                },
                boardId: boardId
            }
        })

        return new ColumnMapper().toDomain(prismaColumn);
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
                    images: {create: task.images?.map(img => ({
                        //id: img.id,
                        //taskId: task.id,
                        filename: img.filename,
                        storedName: img.storedName,
                        mimetype: img.mimetype,
                        size: img.size,
                        width: img.width,
                        height: img.height,
                        url: img.url,
                        thumbnailUrl: img.thumbnailUrl,
                        order: img.order, 
                        createdAt:img.createdAt,
                        updatedAt: img.updatedAt
                    }))}
                }))
            }
        }

        const prismaColumn = await this.prisma.column.update({
            where:{id: columnID},
            data: updateData,
            include:{
                tasks: {include: {images: true}, orderBy: {order: 'asc'}}
            }
        });

        if (!prismaColumn)
            return null;

        return new ColumnMapper().toDomain(prismaColumn);
    }

    async delete(columnID: number): Promise<boolean> {
        const prismaColumn = await this.prisma.column.delete({
            where:{id: columnID},
            include: {tasks: {include: {images: true}}}
        })

        if (!prismaColumn)
            return false;

        return true;
    }
    async findAll(): Promise<Column[]> {
        const prismaColumns = await this.prisma.column.findMany({
            include:{
                tasks: {include: {images: true}, orderBy: {order: 'asc'}}   
            }
        });

        if (!prismaColumns)
            return [];

        return new ColumnMapper().toDomainMany(prismaColumns);
    }

    async find(columnID: number): Promise<Column | null>{
        const prismaColumn = await this.prisma.column.findUnique({
            where:{id: columnID},
            include:{tasks: {include: {images: true}, orderBy: {order: 'asc'}}}
        })
        
        if (!prismaColumn)
            return null;
        
        return new ColumnMapper().toDomain(prismaColumn);
    }
}