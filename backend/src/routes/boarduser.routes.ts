import { Router } from "express";
import { BoardUserController } from "../controller/board-user-controller";

export function createBoardUserRoutes(boardUserController : BoardUserController): Router{
    const router = Router();

    router.get('/', boardUserController.findAll.bind(boardUserController));
    router.get('/user/:userId', boardUserController.findByUserId.bind(boardUserController));
    router.get('/board/:boardId', boardUserController.findByBoardId.bind(boardUserController));

    router.post('/', boardUserController.create.bind(boardUserController));
    router.put('/boards/:boardId/users/:userId', boardUserController.update.bind(boardUserController));
    router.delete('/boards/:boardId/users/:userId', boardUserController.delete.bind(boardUserController));

    return router;
}