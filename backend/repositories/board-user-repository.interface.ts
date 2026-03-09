import {BoardUser, User, Board} from "../../shared/types"
import {Permission} from '../generated/prisma/enums'

export interface IboardUserRepository
{
    addUserToBoard(boardID: number, user: User, permission: Permission) : Promise<boolean>;
    removeUserFromBoard(boardID: number, user: User) : Promise<boolean>;
    
    findByBoard(boardID: number) : Promise<User[] | null>;
    findByUser(UserID: number) : Promise<Board[] | null>;

    create(board: Omit<BoardUser, 'id' | 'createdAt'>): Promise<BoardUser>;
    update(userID: number, boardID: number, data: Partial<BoardUser>): Promise<BoardUser | null>;
    delete(userID: number, boardID: number): Promise<boolean>;
    findAll(): Promise<BoardUser[]>;
}