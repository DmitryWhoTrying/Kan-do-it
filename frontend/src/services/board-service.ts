// frontend/src/services/board.service.ts
import apiClient from './api';
import { Board, BoardUser, Column, Task} from '../../../shared/types';
import { socketService } from '../socket/socket-service';

// Тип для ответа API (единый формат)
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class BoardService {
  private readonly boardEndpoint = '/boards';
  private readonly columnEndpoint = '/columns';
  private readonly taskEndpoint = '/tasks';
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
    console.log('request result:', response);
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

  async getBoardUser(userId: number, boardId: number): Promise<BoardUser>{
    const response = await apiClient.get<ApiResponse<BoardUser[]>>(
      `${this.boardUserEndpoint}/user/${userId}`,
    );
    if (!response.data.success || !response.data.data)
      throw new Error(response.data.error || 'Failed to find board user');

    const boardUser = response.data.data.filter((usr) => {return usr.boardId === boardId;})[0];
      
    return boardUser;
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


  //колоночность
  async addColumn(boardId: number, column: Omit<Column, 'id'>): Promise<Column> {
    console.log('trying to create column');
    const response = await apiClient.post<ApiResponse<Column>>(
    `${this.columnEndpoint}/`,
    {column, boardId}
  );
  
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to add column');
    }
    
    return response.data.data;
  }

  async updateColumn(boardId: number, columnId: number, column: Partial<Column>): Promise<Column>{
    const response = await apiClient.put<ApiResponse<Column>>
    (`${this.columnEndpoint}/${columnId}`,
      {columnId, column, boardId}
    )

    if (!response.data.success || !response.data.data){
      throw new Error(response.data.error || 'Failed to update column');
    }

    return response.data.data;
  }

  async deleteColumn(boardId: number, columnId: number):Promise<Boolean>{
    const response = await apiClient.delete<ApiResponse<Boolean>>
    (`${this.columnEndpoint}/${columnId}/board/${boardId}`,
    );

    if (!response.data.success || !response.data.data){
      throw new Error(response.data.error || 'Failed to delete column');
    }

    return response.data.data;
  }

  //тасочки
  async createTask(boardId: number, columnId: number, task: Omit<Task,'id' | 'createdAt'>):Promise<Task>{
    const response = await apiClient.post<ApiResponse<Task>>(
      `${this.taskEndpoint}/`,
      {columnId, boardId, task}
    );

    if (!response.data.success || !response.data.data){
      throw new Error(response.data.error || 'Failed to create task');
    } 

    return response.data.data;
  }

  async updateTask(boardId:number, columnId: number, taskId:number, data: Partial<Task>):Promise<Task>{
    const response = await apiClient.put<ApiResponse<Task>>(
      `${this.taskEndpoint}/${taskId}`,
      {columnId, boardId, task: data}
    );

    if (!response.data.success || !response.data.data){
      throw new Error(response.data.error || 'Failed to update task');
    }

    return response.data.data;
  }

  async deleteTask(boardId: number, columnId: number, taskId: number):Promise<Boolean>{
    const response = await apiClient.delete<ApiResponse<Boolean>>(
      `${this.taskEndpoint}/column/${columnId}/board/${boardId}`
    );

    if (!response.data.success || !response.data.data){
      throw new Error(response.data.error || 'Failed to delete task');
    }

    return response.data.data;
  }

}

// Экспорт singleton-инстанса
export const boardService = new BoardService();