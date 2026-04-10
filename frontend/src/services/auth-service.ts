import apiClient from "./api";
import { User } from "../../../shared/types";

// Типы для запроса/ответа
export interface LoginRequest {
  username: string;
  password?: string; //без явного пароля, заглушка
}

export interface AuthResponse {
  user: User;
  token: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class AuthService{
    private readonly endpoint = '/auth';

    //попытка входа
    async loginOrRegister({ username, password }: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      `${this.endpoint}/login`,
      { username, password }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Authentication failed');
    }

    return response.data.data;
  }

  async getCurrentUser(token: string): Promise<User | null> {
    try {
      const response = await apiClient.get<ApiResponse<User>>(`${this.endpoint}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return null;
    }
  }

  //сохранение/получени токена на локалстор
  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  }
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  //выход
  clearToken(): void {
    localStorage.removeItem('authToken');
  }
}

export const authService = new AuthService();