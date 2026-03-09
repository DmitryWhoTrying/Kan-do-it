import {Prisma, Column as PrismaColumn} from "../generated/prisma/client.ts"
import {Column} from '../../shared/types.ts'
import { IMapper } from "./mapper.interface.ts";
import { TaskMapper } from "./taskMapper.ts";

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