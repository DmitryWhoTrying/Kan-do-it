import { PrismaClient } from '../generated/prisma/client';
import { IBoardRepository } from "./board-repository.interface";
import { Board } from "../../shared/types";

export class PrimaBoardRepository implements IBoardRepository{
    constructor(private prisma: PrismaClient){}

    async findById(id: number): Promise<Board | null> {
        throw new Error("Method not implemented.");

        const prismaBoard = await this.prisma.board.findUnique({
            where: { id },
            include: {
                users: { include: { user: true } }, // если нужны данные пользователей
                columns: {
                    include: {tasks: true},
                    orderBy: { order: 'asc' }
                }
            }
        });
        if (!prismaBoard)
            return null;
        
        //return prismaBoard;
    }
    async findByName(name: string): Promise<Board | null> {
        throw new Error("Method not implemented.");
    }
    async findByUser(userId: number): Promise<Board[] | null> {
        throw new Error("Method not implemented.");
    }
    findByOwner(ownerId: number): Promise<Board[] | null> {
        throw new Error("Method not implemented.");
    }
    create(board: Omit<Board, "id" | "createdAt">): Promise<Board> {
        throw new Error("Method not implemented.");
    }
    update(id: number, data: Partial<Board>): Promise<Board | null> {
        throw new Error("Method not implemented.");
    }
    delete(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    findAll(): Promise<Board[]> {
        throw new Error("Method not implemented.");
    }
    
}
