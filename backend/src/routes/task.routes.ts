import { Router } from "express";
import { TaskController } from "src/controller/task-controller";
import { TaskService } from "src/service/task-service";
import { PrismaTaskRepository } from "src/repositories/task-prisma-repository";
import {prisma} from "../lib/prisma";

export function createTaskRoutes(taskController: TaskController): Router{
    const router = Router();

    router.get('/', taskController.findAll.bind(taskController));
    router.get('/:taskId', taskController.find.bind(taskController));
    router.get('/column/:columnId', taskController.findByColumn.bind(taskController));

    router.post('/', taskController.create.bind(taskController));
    router.put('/:taskId', taskController.update.bind(taskController));
    router.delete('/:taskId/column/:columnId/board/:boardId', taskController.delete.bind(taskController));

    return router;
}
