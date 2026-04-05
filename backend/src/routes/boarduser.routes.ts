import { Router } from "express";
import { BoardUserController } from "../controller/board-user-controller";
import { BoardUserService } from "./../service/board-user-service";
import { PrimaBoardUserRepository } from "./../repositories/board-user-prisma-repository";
import {prisma} from '../lib/prisma';

export function createBoardUserRoutes(): Router{
    const router = Router();

    const boardUserRepository = new PrimaBoardUserRepository(prisma);
    const boardUserService = new BoardUserService(boardUserRepository);
    const boardUserController = new BoardUserController(boardUserService);

    router.get('/', boardUserController.findAll.bind(boardUserController));
    router.get('/user/:userId', boardUserController.findByUserId.bind(boardUserController));
    router.get('/board/:boardId', boardUserController.findByBoardId.bind(boardUserController));

    router.post('/', boardUserController.create.bind(boardUserController));
    router.put('/boards/:boardId/users/:userId', boardUserController.update.bind(boardUserController));
    router.delete('/boards/:boardId/users/:userId', boardUserController.update.bind(boardUserController));

    return router;
}