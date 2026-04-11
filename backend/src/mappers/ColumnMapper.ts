import 'tsconfig-paths/register'; 
import {Prisma, Column as PrismaColumn} from "@prisma/client"
import {Column} from '../../../shared/types'
import { TaskMapper } from "./TaskMapper";
import { IMapper } from "./Mapper.interface";

export type ColumnWithTasks = PrismaColumn & {tasks?: any[]};

export class ColumnMapper implements IMapper<Column, PrismaColumn>{
    toDomain(prismaColumn: PrismaColumn & { tasks?: any[] }): Column {
        return {
            id: prismaColumn.id,
            title: prismaColumn.title,
            tasks: prismaColumn.tasks 
                ? new TaskMapper()
                        .toDomainMany(prismaColumn.tasks) 
                : [],
            order: prismaColumn.order
        }
    }
    toDomainMany(prismaColumns: PrismaColumn[]): Column[] {
        return prismaColumns.map(col => this.toDomain(col));
    }
    
}