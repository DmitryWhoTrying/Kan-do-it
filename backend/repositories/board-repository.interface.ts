import {Board} from "../../shared/types"

export interface IBoardRepository{
    findById(id: number): Promise<Board | null>;
    findByName(name: string): Promise<Board[] | null>;
    findByUser(userId: number): Promise<Board[] | null>;
    findByOwner(ownerId: number): Promise<Board[] | null>;

    create(board: Omit<Board, 'id' | 'createdAt'>): Promise<Board>;
    update(id: number, data: Partial<Board>): Promise<Board | null>;
    delete(id: number): Promise<boolean>;
    findAll(): Promise<Board[]>;
}