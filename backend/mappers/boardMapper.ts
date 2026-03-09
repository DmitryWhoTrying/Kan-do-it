import {Board as PrismaBoard, Column as PrismaColumn, BoardUser as PrismaBoardUser} from "../generated/prisma/client"
import {Board} from '../../shared/types'
import {IMapper} from "./mapper.interface"
import { ColumnMapper } from "./columnMapper";
import { BoardUserMapper } from "./boardUserMapper";

export class BoardMapper implements IMapper<Board, PrismaBoard>{
    toDomain(
        prismaBoard: PrismaBoard & { 
        columns?: any[]; 
        users?: (any & { user: { id: number; name: string } })[] }
    ): Board {
        return {
        id: prismaBoard.id,
        name: prismaBoard.name,
        // Преобразуем пользователей: из массива BoardUser в массив имён (или ID)
        users: prismaBoard.users 
            ? prismaBoard.users.map(bu => bu.user.name) 
            : [],
        columns: prismaBoard.columns 
            ? new ColumnMapper().toDomainMany(prismaBoard.columns) 
            : [],
        };
    }
    
    toDomainMany(prismaBoard: PrismaBoard[]): Board[] {
        return prismaBoard.map(brd => this.toDomain(brd));
    }

}