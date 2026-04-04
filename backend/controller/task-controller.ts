import { Request, Response } from "express";
import {TaskService} from "../service/task-service";

export class TaskController{
    constructor(private taskService: TaskService){};

    async create(req: Request, res: Response){
        const task = await this.taskService.create(req.body.task, req.body.columnId);
        if (task)
            res.status(200).json(task);
        else
            res.status(500).json({Error: 
                "Cannot create task with column id and data: " 
                    + req.body.columnId + req.body.task});
    }

    async update(req: Request, res: Response){
        const task = await this.taskService.update(req.body.taskId, req.body.task, req.body.columnId);
        if (task)
            res.status(200).json(task);
        else
            res.status(500).json({Error: 
                "Cannot update task with task id & column id & data" 
                + req.body.taskId + req.body.columnI + req.body.task});
    }

    async delete(req: Request, res: Response){
        const task = await this.taskService.delete(req.body.taskId);
        if (task)
            res.status(200).json({Message: "Delete task with id" + req.body.taskId});
        else
            res.status(500).json({Error: "Cannot delete task with id " + req.body.taskId});
    }

    async findAll(req: Request, res: Response){
        const tasks = await this.taskService.findAll();
        if (tasks)
            res.status(200).json(tasks);
        else
            res.status(500).json({Error: "Unexpected error or no tasks"});
    }

    async find(req: Request, res: Response){
        const task = await this.taskService.find(req.body.taskId);
        if (task)
            res.status(200).json(task);
        else
            res.status(500).json({Error: "Cannot find task with id: " + req.body.taskId});
    }

    async findByColumn(req: Request, res: Response){
        const task = await this.taskService.findByColumn(req.body.columnId);
        if (task)
            res.status(200).json(task);
        else
            res.status(500).json({Error: "Cannot find tasks with columnId " + req.body.columnId});
    }
}