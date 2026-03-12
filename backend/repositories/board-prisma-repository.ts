import { PrismaClient, Permission, Prisma } from '../generated/prisma/client';
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
        try{
            const updateData: Prisma.BoardUpdateInput={
                name: data.name,
            };

            if (data.users){
                updateData.users = {
                    deleteMany:{},
                    create: data.users.map(usr => ({
                        userId: usr.userId,
                        user: {connect: {id: usr.userId}},
                        permission: BoardUserMapper.mapPrismaPermission(usr.permission),
                    })),
                }
            };

            if (data.columns){
                updateData.columns = {
                    deleteMany: {},
                    create: data.columns.map(col => ({
                        title: col.title,
                        order: col.order ?? 0,
                        taks:{
                            create: col.tasks.map(task=>({
                                title: task.title,
                                description: task.description,
                                startDate: new Date(task.startDate),
                                endDate: task.endDate ? new Date(task.endDate) : null,
                                tag: task.tag ?? "",
                                order: task.order ?? 0,
                            }))
                        }
                    }))
                }
            }

            const prismaBoard = await this.prisma.board.update({
                where: {id},
                data: updateData,
                include:{
                    users: {include: {user:true}},
                    columns:{
                        include: {tasks: true},
                        orderBy: {order: 'asc'},
                    }
                }
            })
            
            return new BoardMapper().toDomain(await prismaBoard);
        }
        catch (ex){
            if ((ex as any).code === 'P2025') {
            return null;
        }
        console.error('Unexpected error during board update', ex);
        throw ex;
        }
    }
    async delete(id: number): Promise<boolean> {
        const deleteBoard = await this.prisma.board.delete({
            where: {
                id: id
            }
        });
        if (deleteBoard)
            return true;
        return false;
    }

    async findAll(): Promise<Board[]> {
        const prismaBoards = await this.prisma.board.findMany({
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

        return new BoardMapper().toDomainMany(prismaBoards);
    }
}
