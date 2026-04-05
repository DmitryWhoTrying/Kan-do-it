import {IBoardRepository} from "../repositories/board-repository.interface"
import { Board } from "../../../shared/types";

export class BoardService{
    constructor(
        private boardRepository: IBoardRepository,
    ){};

    async getAllBoards(){
        return await this.boardRepository.findAll();
    }

    async getBoardById(id: number){
        return await this.boardRepository.findById(id);
    }

    async getBoardByUser(userId: number){
        return await this.boardRepository.findByUser(userId);
    }

    async getBoardByOwner(ownerId: number){
        return await this.boardRepository.findByOwner(ownerId);
    }

    async createBoard(data: Board){
        const board = await this.boardRepository.create(data);
        return board;
    }

    async updateBoard(data: Partial<Board>, boardId: number){
        const board = await this.boardRepository.update(boardId, data);
        return board;
    }

    async deleteBoard(boardId: number){
        const board = await this.boardRepository.delete(boardId);
        return board;
    }

    async checkUserAccess(boardId: number, userId: number){
        const boardUsers = await this.boardRepository.findById(boardId);
        if (boardUsers?.users.find(bu => {bu.userId === userId}))
            return true;
        return false;
    }

    async chechIsOwner(boardId: number, userId: number){
        const boardUsers = await this.boardRepository.findById(boardId);
        
        if (boardUsers?.users.find(bu => {bu.userId === userId && bu.permission === 'owner'}))
            return true;
        return false;
    }
}
