import { BoardUserService } from "../service/board-user-service";
import { Request, Response } from "express";

export class BoardUserController{
    constructor(private boardUserService: BoardUserService){
    }

    async findAll(req: Request, res: Response){
        const boardUsers = await this.boardUserService.findAll();
        res.status(200).json({success: true, data:boardUsers});
    }

    async findByBoardId(req: Request, res: Response){
        const boardUsers = await this.boardUserService.findByBoard(req.body.boardId);
        if (boardUsers)
            res.status(200).json({success:true, data: boardUsers});
        else
            res.status(404).json({success: false, error: "Cannot find Board users with id: " + req.body.boardId});
    }

    async findByUserId(req: Request, res: Response){
        const boardUsers = await this.boardUserService.findByUser(req.body.userId);
        if (boardUsers)
            res.status(200).json({success: true, data: boardUsers});
        else
            res.status(404).json({success: false, error: "Cannot find Board users with id: " + req.body.userId});
    }

    async create(req: Request, res: Response){
        const boardUser = await this.boardUserService.create(req.body.boardUser);

        if (boardUser)
            res.status(200).json({success:true, data:boardUser});
        else
            res.status(500).json({success:false, error: "Cannot create user with data:" + req.body.boardUser});
    }

    async update(req: Request, res: Response){
        const boardUser = await this.boardUserService.update(req.body.userId, req.body.boardId, req.body.boardUser);
        if (boardUser)
            res.status(200).json({success:true, data:boardUser});
        else
            res.status(500).json({success:false, error: 'Cannot update user with id & data:' + req.body.userId + req.body.boardId + req.body.boardUser});
    }

    async delete(req: Request, res: Response){
        const boardUser = await this.boardUserService.delete(req.body.userId, req.body.boardId);

        if (boardUser)
            res.status(200).json({success:true, data: 'Board user deleted, id:' + req.body.userId + ' ' + req.body.boardId});
        else (boardUser)
            res.status(500).json({success:false, error: 'Cannot delete user with id: ' + req.body.userid +  ' ' + req.body.boardId});
    }
}