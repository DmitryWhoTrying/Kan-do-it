import {Router} from 'express';
import { AuthController } from 'src/controller/auth-controller';
import { AuthService } from 'src/service/auth-service';
import { UserPrismaRepository } from 'src/repositories/user-prisma-repository';
import {prisma} from '../lib/prisma'

export function createAuthRoutes():Router{
    const router = Router();

  // Dependency injection
  const userRepository = new UserPrismaRepository(prisma);
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);

  // Публичные роуты
  router.post('/login', authController.loginOrRegister.bind(authController));
  router.post('/register', authController.loginOrRegister.bind(authController)); // Алиас для удобства
  
  // Защищённый роут (ну типа)
  router.get('/me', authController.me.bind(authController));

  return router;
}