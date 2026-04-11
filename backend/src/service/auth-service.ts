import { IUserRepository } from "src/repositories/user-repository.interface";
import {User as PrismaUser} from '@prisma/client';

export interface AuthResponse {
  user: {
    id: number;
    name: string;
  };
  token: string; //для будущей совместимости
}

export class AuthService{
    constructor(private userRepository: IUserRepository){};

    async loginOrRegister(username: string): Promise<AuthResponse> {
    if (!username || username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    const cleanUsername = username.trim();

    // 1. Пробуем найти существующего пользователя
    let user = await this.userRepository.findByName(cleanUsername);

    // 2. Если не найден — создаём нового (авто-регистрация)
    if (!user) {
      user = await this.userRepository.create({name: cleanUsername});
    }

    // 3. Генерируем "токен" (для учебного проекта — просто строка)
    // В реальном проекте здесь был бы JWT
    const token = `demo_token_${user.id}_${Date.now()}`;

    return {
      user: {
        id: user.id,
        name: user.name,
      },
      token,
    };
  }


  //Проверка токена (псевдо)
  async verifyToken(token: string): Promise<PrismaUser | null> {
    //костыльненько и грязненько - по учебно-проектски
    if (!token || !token.startsWith('demo_token_')) {
      return null;
    }

    const userId = parseInt(token.split('_')[2]);
    return await this.userRepository.findById(userId);
  }
}