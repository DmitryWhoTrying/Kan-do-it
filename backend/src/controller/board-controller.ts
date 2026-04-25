import {Request, Response} from 'express';
import {BoardService} from '../service/board-service'
import { SocketEmitter } from 'src/socket/socket-emitter';

export class BoardController{
    constructor(
        private boardService: BoardService,
        private socketEmitter: SocketEmitter
    ){}

    async getAll(req: Request, res: Response){
        try{
        const boards = await this.boardService.getAllBoards();
        res.status(200).json({
            success:true,
            data:boards
        });
        }
        catch (err){
            res.status(500).json({success:false, error: "Cannot get all boards"});
        }
    }

    async findById(req: Request, res: Response){
        const board = await this.boardService.getBoardById(Number(req.params.id));
        if (board)
            res.status(200).json({
            success:true,
            data:board
            });
        else
            res.status(404).json({success:false, error: "not found"});
    }

    async findByUser(req: Request, res: Response){
        console.log('Request params: ', req.params);
        try {
            const boards = await this.boardService.getBoardByUser(Number(req.params.userId));

            res.status(200).json({
                success: true,
                data: boards
            });
        } 
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch boards'
            });
        }
    }


    async findByOwner(req: Request, res: Response){
        console.log('Request params: ', req.params);
        const data = await this.boardService.getBoardByOwner(Number(req.params.id));
        if (data)
            res.status(200).json({
                success: true,
                data
            });
        else
            res.status(404).json({
                success:false, 
                Error: "not found"
            });
    }

    async createBoard(req: Request, res: Response){
        const board = await this.boardService.createBoard(req.body);
        if (board)
            res.status(200).json({success: true, data: board});
        else
            res.status(500).json({success: false, error: "cannot create board with params "+req.body})
    }

    async updateBoard(req: Request, res: Response){
        const board = await this.boardService.updateBoard(req.body, Number(req.params.id));
        if (board)
        {
            res.json({
                success:true, 
                data:board
            });
            this.socketEmitter.emitBoardUpdated(board.id, board)
        }
        else
        {
            res.status(500).json({
                success:false,
                error: "cannot update board with id: " + req.params.id
            });
        }
    }

    async deleteBoard(req: Request, res: Response){
        const board = await this.boardService.deleteBoard(Number(req.params.id));
        if (board)
        {
            res.status(200).json({
                data: "successfully delete board with id: " + req.params.id, 
                success:true
            });
            this.socketEmitter.emitBoardDeleted(Number(req.params.id));
        }
        else
            res.status(500).json({
                success: false,
                error: "cannot delete board with id: " + req.params.id
            });
    }
}
