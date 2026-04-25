import {BoardUser} from "../../../shared/types"

export interface IboardUserRepository
{    
    findByBoard(boardID: number) : Promise<BoardUser[] | null>;
    findByUser(userID: number): Promise<BoardUser[] | null>;

    create(board: Omit<BoardUser, 'id' | 'createdAt'>): Promise<BoardUser>;
    update(userID: number, boardID: number, data: Partial<BoardUser>): Promise<BoardUser | null>;
    delete(userID: number, boardID: number): Promise<boolean>;
    findAll(): Promise<BoardUser[]>;
}