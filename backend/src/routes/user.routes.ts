import { Router } from 'express';
import { UserController } from '../controller/user-controller';
import { UserService } from './../service/user-service';
import { UserPrismaRepository } from './../repositories/user-prisma-repository';
import { prisma } from '../lib/prisma';

export function createUserRoutes(): Router{
    const router = Router();

    // Dependency injection
      const userRepository = new UserPrismaRepository(prisma);
      const userService = new UserService(userRepository);
      const userController = new UserController(userService);
    
      // REST endpoints
      router.get('/', userController.findUsers.bind(userController));
      router.get('/:id', userController.findById.bind(userController));
      router.get('/username/:name', userController.findByName.bind(userController));
      
      router.post('/', userController.create.bind(userController));
      router.put('/:id', userController.update.bind(userController));
      router.delete('/:id', userController.delete.bind(userController));
    
      return router;
}