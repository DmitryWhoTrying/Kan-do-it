import {IBoardRepository} from "../repositories/board-repository.interface"
import {PrismaBoardRepository} from "../repositories/board-prisma-repository"
import {Server} from "../node_modules/socket.io"
import { promises } from "node:dns"
import { Board } from "../../shared/types";

export class BoardService{
    constructor(
        private boardRepository: IBoardRepository,
        private io: Server
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
        this.io.emit('board:created', board);
        return board;
    }

    async updateBoard(data: Partial<Board>, boardId: number){
        const board = await this.boardRepository.update(boardId, data);
        this.io.emit('board:updated', board);
        return board;
    }

    async deleteBoard(boardId: number){
        const board = await this.boardRepository.delete(boardId);
        if (board)
            this.io.emit('board:deleted', {boardId});
        else
            this.io.emit('board:delete error');
        return board;
    }
}
