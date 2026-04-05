import { Router } from 'express';
import { BoardController } from '../controller/board-controller';
import { BoardService } from './../service/board-service';
import { PrismaBoardRepository } from './../repositories/board-prisma-repository';
import { prisma } from '../lib/prisma';

export function createBoardRoutes(): Router {
  const router = Router();
  
  // Dependency injection
  const boardRepository = new PrismaBoardRepository(prisma);
  const boardService = new BoardService(boardRepository);
  const boardController = new BoardController(boardService);

  // REST endpoints
  router.get('/', boardController.getAll.bind(boardController));
  router.get('/:id', boardController.findById.bind(boardController));
  router.get('/user/:userId', boardController.findByUser.bind(boardController));
  router.get('/owner/:userId', boardController.findByOwner.bind(boardController));
  
  router.post('/', boardController.createBoard.bind(boardController));
  router.put('/:id', boardController.updateBoard.bind(boardController));
  router.delete('/:id', boardController.deleteBoard.bind(boardController));

  return router;
}