// frontend/src/services/board.service.ts
import apiClient from './api';
import { Board, BoardUser, Column, Task} from '../../../shared/types';

// Тип для ответа API (единый формат)
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class BoardService {
  private readonly boardEndpoint = '/boards';
  private readonly boardUserEndpoint = '/boardUsers';

  // === GET запросы ===

  /** Получить все доски текущего пользователя */
  async getAll(): Promise<Board[]> {
    const response = await apiClient.get<ApiResponse<Board[]>>(this.boardEndpoint);
    return response.data.data || [];
  }

  /** Получить доску по ID */
  async getById(boardId: number): Promise<Board> {
    const response = await apiClient.get<ApiResponse<Board>>(`${this.boardEndpoint}/${boardId}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch board');
    }
    
    return response.data.data;
  }

  /** Получить доски, где пользователь является участником */
  async getByUser(userId: number): Promise<Board[]> {
    const response = await apiClient.get<ApiResponse<Board[]>>(`${this.boardEndpoint}/user/${userId}`);
    return response.data.data || [];
  }

  /** Получить доски, где пользователь является владельцем */
  async getByOwner(userId: number): Promise<Board[]> {
    const response = await apiClient.get<ApiResponse<Board[]>>(`${this.boardEndpoint}/owner/${userId}`);
    return response.data.data || [];
  }

  // === POST / PUT / DELETE ===

  /** Создать новую доску */
  async create(dto: Board): Promise<Board> {
    const response = await apiClient.post<ApiResponse<Board>>(this.boardEndpoint, dto);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create board');
    }
    
    return response.data.data;
  }

  /** Обновить доску */
  async update(boardId: number, dto: Partial<Board>): Promise<Board> {
    const response = await apiClient.put<ApiResponse<Board>>(`${this.boardEndpoint}/${boardId}`, dto);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update board');
    }
    
    return response.data.data;
  }

  /** Удалить доску */
  async delete(boardId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<unknown>>(`${this.boardEndpoint}/${boardId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete board');
    }
  }

  // === Управление пользователями доски ===

  /** Получить все связи пользователей с досками */
  async getAllBoardUsers(): Promise<BoardUser[]> {
    const response = await apiClient.get<ApiResponse<BoardUser[]>>(this.boardUserEndpoint);
    return response.data.data || [];
  }

  /** Получить связи по userId */
  async getByUserId(userId: number): Promise<BoardUser[]> {
    const response = await apiClient.get<ApiResponse<BoardUser[]>>(
      `${this.boardUserEndpoint}/user/${userId}`
    );
    return response.data.data || [];
  }

  /** Получить связи по boardId (основной метод для страницы доски) */
  async getByBoardId(boardId: number): Promise<BoardUser[]> {
    const response = await apiClient.get<ApiResponse<BoardUser[]>>(
      `${this.boardUserEndpoint}/board/${boardId}`
    );
    return response.data.data || [];
  }

  /** Добавить пользователя на доску */
  async addUser(boardId: number, userId: number, permission: BoardUser['permission']): Promise<BoardUser> {
    const response = await apiClient.post<ApiResponse<BoardUser>>(this.boardUserEndpoint, {
      boardId,
      userId,
      permission,
    });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to add user to board');
    }
    return response.data.data;
  }

  /** Обновить права пользователя */
  async updateUserPermission(boardId: number, userId: number, permission: BoardUser['permission']): Promise<BoardUser> {
    const response = await apiClient.put<ApiResponse<BoardUser>>(
      `${this.boardUserEndpoint}/boards/${boardId}/users/${userId}`,
      { permission }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update permission');
    }
    return response.data.data;
  }

  /** Удалить пользователя из доски */
  async removeUser(boardId: number, userId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<unknown>>(
      `${this.boardUserEndpoint}/boards/${boardId}/users/${userId}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to remove user from board');
    }
  }
}

// Экспорт singleton-инстанса
export const boardService = new BoardService();