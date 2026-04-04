import { BoardUserService } from "../service/board-user-service";
import { Request, Response } from "express";

export class BoardUserController{
    constructor(private boardUserService: BoardUserService){
    }

    async findAll(req: Request, res: Response){
        const boardUsers = await this.boardUserService.findAll();
        res.status(200).json(boardUsers);
    }

    async findByBoardId(req: Request, res: Response){
        const boardUsers = await this.boardUserService.findByBoard(req.body.boardId);
        if (boardUsers)
            res.status(200).json(boardUsers);
        else
            res.status(404).json({Error: "Cannot find Board users with id: " + req.body.boardId});
    }

    async findByUserId(req: Request, res: Response){
        const boardUsers = await this.boardUserService.findByUser(req.body.userId);
        if (boardUsers)
            res.status(200).json(boardUsers);
        else
            res.status(404).json({Error: "Cannot find Board users with id: " + req.body.userId});
    }
}