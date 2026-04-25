import { Router } from 'express';
import { UserController } from '../controller/user-controller';

export function createUserRoutes(userController: UserController): Router{
    const router = Router();
    
      // REST endpoints
      router.get('/', userController.findUsers.bind(userController));
      router.get('/:id', userController.findById.bind(userController));
      router.get('/username/:name', userController.findByName.bind(userController));
      
      router.post('/', userController.create.bind(userController));
      router.put('/:id', userController.update.bind(userController));
      router.delete('/:id', userController.delete.bind(userController));
    
      return router;
}