import {Board as PrismaBoard, Column as PrismaColumn, BoardUser as PrismaBoardUser, User as PrismaUser} from "../generated/prisma/client"
import {Board} from '../../shared/types'
import { ColumnMapper, ColumnWithTasks } from "./ColumnMapper";
import { IMapper } from "./Mapper.interface";
import { BoardUserMapper } from "./boardUserMapper";

export type BoardWithRelations = PrismaBoard & {
  columns?: ColumnWithTasks[];
  // Массив BoardUser, у каждого внутри есть объект user
  users?: (PrismaBoardUser & { user: PrismaUser })[];
};

export class BoardMapper implements IMapper<Board, PrismaBoard>{
    toDomain(prismaBoard: BoardWithRelations): Board {
    return {
      id: prismaBoard.id,
      name: prismaBoard.name,
      // Просто маппим в плоский массив BoardUser с boardId
      users: prismaBoard.users 
        ? new BoardUserMapper().toDomainMany(prismaBoard.users) 
        : [],
      columns: prismaBoard.columns 
        ? new ColumnMapper().toDomainMany(prismaBoard.columns as ColumnWithTasks[]) 
        : [],
    };
  }
    
    toDomainMany(prismaBoard: PrismaBoard[]): Board[] {
        return prismaBoard.map(brd => this.toDomain(brd));
    }

}