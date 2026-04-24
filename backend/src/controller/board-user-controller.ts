import { SocketEmitter } from "src/socket/socket-emitter";
import { BoardUserService } from "../service/board-user-service";
import { Request, Response } from "express";

export class BoardUserController{
    constructor(private boardUserService: BoardUserService, private socketEmitter: SocketEmitter){
    }

    async findAll(req: Request, res: Response){
        const boardUsers = await this.boardUserService.findAll();
        res.status(200).json({success: true, data:boardUsers});
    }

    async findByBoardId(req: Request, res: Response){
        const boardUsers = await this.boardUserService.findByBoard(Number(req.params.boardId));
        if (boardUsers)
            res.status(200).json({success:true, data: boardUsers});
        else
            res.status(404).json({success: false, error: "Cannot find Board users with id: " + Number(req.params.boardId)});
    }

    async findByUserId(req: Request, res: Response){
        const boardUsers = await this.boardUserService.findByUser(Number(req.params.userId));
        if (boardUsers)
            res.status(200).json({success: true, data: boardUsers});
        else
            res.status(404).json({success: false, error: "Cannot find Board users with id: " + Number(req.params.userId)});
    }

    async create(req: Request, res: Response){
        console.log('handle board user creating', req.body)
        const boardUser = await this.boardUserService.create(req.body.boardUser);

        if (boardUser)
            res.status(200).json({success:true, data:boardUser});
        else
            res.status(500).json({success:false, error: "Cannot create user with data:" + req.body.boardUser});
    }

    async update(req: Request, res: Response){
        console.log('handle board user updating, body:', req.body);
        console.log('handle board user updating, params:', req.params);
        const boardUser = await this.boardUserService.update(Number(req.params.userId), Number(req.params.boardId), {permission: req.body.permission});
        if (boardUser)
        {
            res.status(200).json({success:true, data:boardUser});
             this.socketEmitter.emitUserRoleChanged(Number(req.params.boardId), Number(req.params.userId), req.body.permission);
        }
        else
            res.status(500).json({success:false, error: 'Cannot update user with id & data:'});

    }

    async delete(req: Request, res: Response){
        const boardUser = await this.boardUserService.delete(Number(req.params.userId), Number(req.params.boardId));

        if (boardUser)
        {
            res.status(200).json({success:true, data: 'Board user deleted, id:' + Number(req.params.userId) + ' ' + Number(req.params.boardId)});
            this.socketEmitter.emitUserKicked(Number(req.params.boardId), Number(req.params.userId));
        }
        else (boardUser)
            res.status(500).json({success:false, error: 'Cannot delete user with id: ' + Number(req.params.userId) +  ' ' + Number(req.params.boardId)});
    }
}