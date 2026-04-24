import { Router } from "express";
import { TaskImageController } from "../controller/task-image-controller";

export function createTaskImageRoutes(taskImageController: TaskImageController): Router {
    const router = Router();

    router.post('/tasks/:taskId/images', taskImageController.upload.bind(taskImageController));
    router.delete('/tasks/:taskId/images/:imageId', taskImageController.delete.bind(taskImageController));
    router.get('/tasks/:taskId/images', taskImageController.list.bind(taskImageController));
    
    return router;
}