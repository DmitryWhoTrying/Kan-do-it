import { IboardUserRepository } from "../repositories/board-user-repository.interface";
import { BoardUser } from "../../../shared/types";


export class BoardUserService{
    constructor(
            private boardUserRepository: IboardUserRepository,
    ){};

    async findByBoard(boardId: number){
        return await this.boardUserRepository.findByBoard(boardId);
    }

    async findByUser(userId: number){
        return await this.boardUserRepository.findByUser(userId);
    }

    async create(data: Omit<BoardUser, 'id' | 'createdAt'>){
        const boardUser = await this.boardUserRepository.create(data);
        return boardUser;
    }

    async update(userId: number, boardId: number, data: Partial<BoardUser>){
        const boardUser = await this.boardUserRepository.update(userId, boardId, data);
        return boardUser;
    }

    async delete(userId: number, boardId: number){
        const boardUser = await this.boardUserRepository.delete(userId, boardId);
        return boardUser;
    }

    async findAll(){
        return await this.boardUserRepository.findAll();
    }
}