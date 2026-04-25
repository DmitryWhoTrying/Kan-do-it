import {Router} from 'express';
import { AuthController } from 'src/controller/auth-controller';


export function createAuthRoutes(authController: AuthController):Router{
    const router = Router();

  // Публичные роуты
  router.post('/login', authController.loginOrRegister.bind(authController));
  router.post('/register', authController.loginOrRegister.bind(authController)); // Алиас для удобства
  
  // Защищённый роут (ну типа)
  router.get('/me', authController.me.bind(authController));

  return router;
}