import {Request, Response} from 'express';
import {BoardService} from '../service/board-service'
import { ClientToServerEvents, ServerToClientEvets } from '../../shared/socket-events.types';

export class BoardController{
    constructor(private boardService: BoardService){}

    async getAll(req: Request, res: Response){
        const boards = await this.boardService.getAllBoards();
        res.status(200).json(boards);
    }

    async findById(req: Request, res: Response){
        const board = await this.boardService.getBoardById(Number(req.params.id));
        if (board)
            res.status(200).json(board);
        else
            res.status(404).json({Error: "not found"});
    }

    async findByUser(req: Request, res: Response){
        const boards = await this.boardService.getBoardByUser(Number(req.params.id));
        if (boards)
            res.status(200).json(boards);
        else
            res.status(404).json({Error: "not found"});
    }

    async findByOwner(req: Request, res: Response){
        const boards = await this.boardService.getBoardByOwner(Number(req.params.id));
        if (boards)
            res.status(200).json(boards);
        else
            res.status(404).json({Error: "not found"});
    }

    async createBoard(req: Request, res: Response){
        const board = await this.boardService.createBoard(req.body);
        if (board)
            res.status(201).json(board);
        else
            res.status(500).json({Error: "cannot create board with params "+req.body})
    }

    async updateBoard(req: Request, res: Response){
        const board = await this.boardService.updateBoard(req.body, Number(req.params.id));
        if (board)
            res.json(board);
        else
            res.status(500).json({Error: "cannot update board with id: " + req.params.id});
    }

    async deleteBoard(req: Request, res: Response){
        const board = await this.boardService.deleteBoard(Number(req.params.id));
        if (board)
            res.status(200).json({Message: "successfully delete board with id: " + req.params.id});
        else
            res.status(500).json({Error: "cannot delete board with id: " + req.params.id});
    }
}
