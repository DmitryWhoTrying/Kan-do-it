import { Router } from "express";
import { TaskImageController } from "../controller/task-image-controller";
import { upload } from "src/lib/upload-config";

export function createTaskImageRoutes(taskImageController: TaskImageController): Router {
    const router = Router();

    router.post('/boards/:boardId/tasks/:taskId/images', 
        upload.single('image'),
        taskImageController.upload.bind(taskImageController));

    router.delete('/boards/:boardId/tasks/:taskId/images/:imageId', taskImageController.delete.bind(taskImageController));
    router.get('/tasks/:taskId/images', taskImageController.list.bind(taskImageController));
    
    return router;
}