import { PrismaClient, Permission, Prisma } from '../generated/prisma/client';
import { IboardUserRepository } from "./board-user-repository.interface";
import { Board, BoardUser, User } from "../../shared/types";
import { BoardMapper } from '../mappers/boardMapper';
import { PureComponent } from 'react';
import { BoardUserMapper } from '../mappers/boardUserMapper';


export class PrimaBoardUserRepository implements IboardUserRepository{
    constructor(private prisma: PrismaClient){}

    async findByBoard(boardID: number): Promise<BoardUser[] | null> {
        const prismaBoardUsers = await this.prisma.boardUser.findMany({
            where:
            {
                boardId: boardID
            },
            include:
            {
                user: true
            }
        });

        return new BoardUserMapper().toDomainMany(prismaBoardUsers);
    }

    async findByUser(userID: number): Promise<BoardUser[] | null> {
        const prismaBoardUsers = await this.prisma.boardUser.findMany({
            where:
            {
                userId: userID
            },
            include:
            {
                user: true
            }
        });

        return new BoardUserMapper().toDomainMany(prismaBoardUsers);
    }


    async create(boardUser: Omit<BoardUser, 'id' | 'createdAt'>): Promise<BoardUser> {
        const prismaBoardUser = await this.prisma.boardUser.create({
            data:
            {
                userId: boardUser.userId,
                boardId: boardUser.boardId,
                permission: BoardUserMapper.mapPrismaPermission(boardUser.permission)
            },
            include:{
                user: true,
                board: true
            }
        });

        return new BoardUserMapper().toDomain(prismaBoardUser);
    }


    async update(userID: number, boardID: number, data: Partial<BoardUser>): Promise<BoardUser | null> {
        const updateData: Prisma.BoardUserUpdateInput={
        }
        
        if (data.permission)
        {
            updateData.permission = BoardUserMapper
                                    .mapPrismaPermission(data.permission);
        };

        const prismaBoardUser = await this.prisma.boardUser.update({
            where:{
                userId: userID,
                boardId: boardID
            },
            data: updateData,
            include:{
                user: true
            }
        });

        if (!prismaBoardUser)
            return null;

        return new BoardUserMapper().toDomain(prismaBoardUser);
    }


    async delete(userID: number, boardID: number): Promise<boolean> {
        const boardUser = await this.prisma.boardUser.delete({
            where: {
                userId: userID, 
                boardId: boardID
            }
        });

        if (!boardUser)
            return false;

        return true;
    }
    async findAll(): Promise<BoardUser[]> {
        const boardUsers = await this.prisma.boardUser.findMany({
          include: {user: true}  
        })

        if (!boardUsers)
            return []

        return new BoardUserMapper().toDomainMany(boardUsers);
    }

}