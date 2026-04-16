import { SocketEmitter } from "src/socket/socket-emitter";
import { ColumnService } from "../service/column-service";
import {Request, Response} from 'express';

export class ColumnController{
    constructor(
        private columnService: ColumnService,
        private socketEmmiter: SocketEmitter
    ){};

    async create(req: Request, res: Response){
        const column = await this.columnService.create(req.body.column, req.body.boardId);

        if (column){
            res.status(200).json({success: true, data:column});
            this.socketEmmiter.emitColumnCreated(req.body.boardId, column);
        }
        else
            res.status(500).json({success:false, error: "Cannot create column with data: " + req.body.column + req.body.boardId});
    }

    async update(req: Request, res: Response){
        const column = await this.columnService.update(req.body.columnId, req.body.column);
        if (column)
        {
            res.status(200).json({success:true, data:column});
            this.socketEmmiter.emitColumnUpdated(req.body.boardId, column);
        }
        else
            res.status(500).json({success:false, error: "Cannot update column with data: " + req.body.columnId + ' ' + req.body.column})
    }

    async delete(req: Request, res: Response){
        const column = await this.columnService.delete(req.body.columnId);
        if (column)
        {
            res.status(200).json({success:true, data:column});
            this.socketEmmiter.emitColumnDeleted(req.body.boardId, req.body.columnId);
        }
        else
            res.status(500).json({success:false, error: "Cannot delete column with id: " + req.body.columnId})
    }

    async findAll(req: Request, res: Response){
        const columns = await this.columnService.findAll();
        if (columns)
            res.status(200).json({success:true, data:columns});
        else
            res.status(500).json({success:false, error: "Unexpected error or no columns"})
    }

    async find(req: Request, res: Response){
        const column = await this.columnService.find(req.body.columnId);
        if (column)
            res.status(200).json({success:true, data:column});
        else
            res.status(500).json({success:false, error: "Cannot find column with id " + req.body.columnId});
    }

    async findByBoard(req: Request, res: Response){
        const columns = await this.columnService.findByBoard(req.body.boardId);
        if (columns)
            res.status(200).json({success:true, data:columns});
        else
            res.status(500).json({success:false, error: "Cannot find columns with boardId" + req.body.boardId});
    }
}