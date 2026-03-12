import {BoardUser, User, Board} from "../../shared/types"
import {Permission} from '../generated/prisma/enums'

export interface IboardUserRepository
{    
    findByBoard(boardID: number) : Promise<BoardUser[] | null>;

    create(board: Omit<BoardUser, 'id' | 'createdAt'>): Promise<BoardUser>;
    update(userID: number, boardID: number, data: Partial<BoardUser>): Promise<BoardUser | null>;
    delete(userID: number, boardID: number): Promise<boolean>;
    findAll(): Promise<BoardUser[]>;
}