import { Router } from 'express';
import { ColumnController } from '../controller/column-controller';

export function createColumnRoutes(columnController: ColumnController): Router{
    const router = Router();

    router.get('/', columnController.findAll.bind(columnController));
    router.get('/:columnId', columnController.find.bind(columnController));
    router.get('/board/:boardId', columnController.findByBoard.bind(columnController));

    router.post('/', columnController.create.bind(columnController));
    router.put('/:columnId', columnController.update.bind(columnController));
    router.delete('/:columnId/board/:boardId', columnController.delete.bind(columnController));

    return router;
}