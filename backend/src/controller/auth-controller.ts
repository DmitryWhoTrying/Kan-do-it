import { Request, Response } from "express";
import { AuthService } from "src/service/auth-service";

export class AuthController{
    constructor(private authService: AuthService){}

    async loginOrRegister(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      // Валидация входных данных
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Username is required' 
        });
      }

      // Password игнорируем в образовательных целях
      if (password) {
        console.log(`[Demo Auth] Password provided for ${username} (ignored)`);
      }

      const result = await this.authService.loginOrRegister(username);

      res.status(200).json({
        success: true,
         result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Authentication failed',
      });
    }
  }

  /**
   * Проверка текущего пользователя по токену
   */
  async me(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ success: false, error: 'No token' });
      }

      const user = await this.authService.verifyToken(token);
      
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }

      res.status(200).json({
        success: true,
         data:{ id: user.id, name: user.name },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to verify token',
      });
    }
  }
}