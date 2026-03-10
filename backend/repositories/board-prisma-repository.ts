import { PrismaClient, Permission } from '../generated/prisma/client';
import { IBoardRepository } from "./board-repository.interface";
import { Board } from "../../shared/types";
import { BoardMapper } from '../mappers/boardMapper';
import { PureComponent } from 'react';
import { BoardUserMapper } from '../mappers/boardUserMapper';


export class PrimaBoardRepository implements IBoardRepository{
    constructor(private prisma: PrismaClient){}

    async findById(id: number): Promise<Board | null> {
        //throw new Error("Method not implemented.");
        const prismaBoard = await this.prisma.board.findUnique({
            where: { id },
            include: {
            users: { 
                include: { user: true } 
            },
            columns: {
                include: {tasks: true},
                orderBy: { order: 'asc' }
            }
            }
        });
        if (!prismaBoard)
            return null;
        
        return new BoardMapper().toDomain(prismaBoard);
    }
    async findByName(boardName: string): Promise<Board[] | null> {
        const prismaBoards = await this.prisma.board.findMany(
            {
                where: {name: boardName},
                include: {
                    users:{
                        include: {user: true}
                    },
                    columns:{
                        include: {tasks: true},
                        orderBy: {order: 'asc'}
                    }
                }
            }
        );
        if (!prismaBoards)
            return null;
        
        return new BoardMapper().toDomainMany(prismaBoards);
    }


    async findByUser(userId: number): Promise<Board[] | null> {
        const prismaBoards = await this.prisma.board.findMany(
            {
                where:{
                    users: {
                        some:{
                            userId: userId
                        }
                    }
                },
                include: {
                    users:{
                        include: {user: true}
                    },
                    columns:{
                        include: {tasks: true},
                        orderBy: {order: 'asc'}
                    }
                }
            }
        );
        
        if (!prismaBoards)
            return null;

        return new BoardMapper().toDomainMany(prismaBoards);
    }

    async findByOwner(ownerId: number): Promise<Board[] | null> {
        
        const prismaBoards = await this.prisma.board.findMany({
            where:{
                users:{
                    some:{
                        userId: ownerId,
                        permission: Permission.OWNER
                    }
                }
            },
                include: {
                    users:{
                        include: {user: true}
                    },
                    columns:{
                        include: {tasks: true},
                        orderBy: {order: 'asc'}
                    }
                }
        });

        if (!prismaBoards)
            return null;

        return new BoardMapper().toDomainMany(prismaBoards);
    }
    
    async create(board: Omit<Board, "id" | "createdAt">): Promise<Board> {
        try{
            const prismaBoard = this.prisma.board.create({
                data:{
                    name: board.name,
                    users: {
                        create: board.users.map(usr =>({
                            userId: usr.userId,
                            user: usr.userName,
                            permission: BoardUserMapper.mapPrismaPermission(usr.permission)
                        }))
                    }
                }
            });
            
            return new BoardMapper().toDomain(await prismaBoard);
        }
        catch (ex){
            console.log("unexpected error", ex);
            throw ex;
        }
    }
    async update(id: number, data: Partial<Board>): Promise<Board | null> {
        throw new Error("Method not implemented.");
    }
    async delete(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    async findAll(): Promise<Board[]> {
        throw new Error("Method not implemented.");
    }
    
}
