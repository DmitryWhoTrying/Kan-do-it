import { Router } from 'express';
import { BoardController } from '../controller/board-controller';

export function createBoardRoutes(boardController: BoardController): Router {
  const router = Router();

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