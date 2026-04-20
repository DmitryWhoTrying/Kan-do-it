// frontend/src/store/slices/boardSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Board, BoardUser, Column, Task } from '../../../shared/types';
import { act } from 'react';

interface BoardState {
  currentBoard: Board | null;      
  currentUser: BoardUser | null; 
  authToken: string | null;  

  isLoading: boolean;       
  isAddingTask: boolean;
  isCreating: boolean;
   
  newTaskTitle: string;

  error: string | null;            
}

const initialState: BoardState = {
  currentBoard: null,
  currentUser: null,
  authToken: null,

  isLoading: false,
  error: null,
  isAddingTask: false,
  isCreating: false,

  newTaskTitle: ''
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    // === Загрузка/сброс доски ===
    
    setBoard: (state, action: PayloadAction<Board>) => {
      state.currentBoard = action.payload;
      state.error = null;
    },

    clearBoard: (state) => {
      state.currentBoard = null;
      state.currentUser = null;
      state.authToken = null;
      state.error = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    //token
    setAuthToken: (state, action: PayloadAction<string | null>) => {
      state.authToken = action.payload;
    },

    logout: (state) => {
      state.currentBoard = null;
      state.currentUser = null;
      state.authToken = null;
      state.error = null;
    },

    // === Пользователь и права ===
    
    setCurrentUser: (state, action: PayloadAction<BoardUser>) => {
      state.currentUser = action.payload;
    },

    clearCurrentUser: (state) => {
      state.currentUser = null;
    },

    // === Обновление доски ===
    
    updateBoardName: (state, action: PayloadAction<string>) => {
      if (state.currentBoard) {
        state.currentBoard.name = action.payload;
      }
    },

    updateBoardFields:(state, action: PayloadAction<Partial<Board>>) => {
      if (state.currentBoard) {
         Object.assign(state.currentBoard, action.payload);
      }
    },

    // === Колонки ===
    addColumn: (state, action: PayloadAction<Column>) => {
      if (state.currentBoard) {
        state.currentBoard.columns.push(action.payload);
        // Сортируем по order после добавления
        state.currentBoard.columns.sort((a, b) => (a.order ?? a.id) - 
        (b.order ?? b.id));
      }
    },

    updateColumn: (state, action: PayloadAction<Column>) => {
      if (!state.currentBoard) return;
      
      const index = state.currentBoard.columns.findIndex(
        col => col.id === action.payload.id
      );
      
      if (index !== -1) {
        state.currentBoard.columns[index] = action.payload;
      }
    },

    updateColumnsOrder: (state, action: PayloadAction<Column[]>) => {
      if (state.currentBoard) {
        state.currentBoard.columns = action.payload;
      }
    },

    removeColumn: (state, action: PayloadAction<number>) => {
      if (!state.currentBoard) return;
      
      state.currentBoard.columns = state.currentBoard.columns.filter(
        col => col.id !== action.payload
      );
    },

    // === Задачи ===
    
    addTask: (state, action: PayloadAction<{ columnId: number; task: Task }>) => {
      if (!state.currentBoard) return;
      
      const column = state.currentBoard.columns.find(
        col => col.id === action.payload.columnId
      );

      //во избежание дублирования
      if (column?.tasks.find( (tsk) => {return tsk.id === action.payload.task.id;}))
        return;
      
      if (column) {
        column.tasks.push(action.payload.task);
        column.tasks.sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));
      }
    },

    updateTask: (state, action: PayloadAction<{ taskId: number; updates: Partial<Task> }>) => {
      if (!state.currentBoard) return;
      
      // Ищем задачу во всех колонках
      for (const column of state.currentBoard.columns) {
        const task = column.tasks.find(t => t.id === action.payload.taskId);
        if (task) {
          Object.assign(task, action.payload.updates);
          return;
        }
      }
    },

    moveTask: (state, action: PayloadAction<{ 
      taskId: number; 
      fromColumnId: number; 
      toColumnId: number; 
      newOrder: number;
    }>) => {
      if (!state.currentBoard) return;
      
      const { taskId, fromColumnId, toColumnId, newOrder } = action.payload;
      
      // Находим задачу в исходной колонке
      const fromColumn = state.currentBoard.columns.find(c => c.id === fromColumnId);
      const taskIndex = fromColumn?.tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === undefined || taskIndex === -1 || !fromColumn) return;
      
      // Извлекаем задачу
      const [task] = fromColumn.tasks.splice(taskIndex, 1);
      
      // Если колонка изменилась — добавляем в новую
      if (fromColumnId !== toColumnId) {
        const toColumn = state.currentBoard.columns.find(c => c.id === toColumnId);
        if (toColumn) {
          // Вставляем на нужную позицию
          const insertIndex = toColumn.tasks.findIndex(t => (t.order ?? 0) >= newOrder);
          if (insertIndex === -1) {
            toColumn.tasks.push(task);
          } else {
            toColumn.tasks.splice(insertIndex, 0, task);
          }
          //task.columnId = toColumnId;
        }
      } else {
        // Та же колонка — просто меняем порядок
        const insertIndex = fromColumn.tasks.findIndex(t => (t.order ?? 0) >= newOrder);
        if (insertIndex === -1) {
          fromColumn.tasks.push(task);
        } else {
          fromColumn.tasks.splice(insertIndex, 0, task);
        }
      }
      
      // Пересчитываем order для всех задач в целевой колонке
      const targetColumn = state.currentBoard.columns.find(c => c.id === toColumnId);
      if (targetColumn) {
        targetColumn.tasks.forEach((t, idx) => {
          t.order = idx;
        });
      }
    },

    removeTask: (state, action: PayloadAction<{ columnId: number; taskId: number }>) => {
      if (!state.currentBoard) return;
      
      const column = state.currentBoard.columns.find(
        col => col.id === action.payload.columnId
      );
      
      if (column) {
        column.tasks = column.tasks.filter(
          task => task.id !== action.payload.taskId
        );
      }
    },

    // === Оптимистичное обновление при Socket-событиях ===
    
    syncBoard: (state, action: PayloadAction<Board>) => {
      // Полная синхронизация (если пришли расхождения)
      state.currentBoard = action.payload;
    },

    syncTask: (state, action: PayloadAction<Task>) => {
      // Обновление задачи от другого пользователя
      if (!state.currentBoard) return;
      
      for (const column of state.currentBoard.columns) {
        const idx = column.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) {
          column.tasks[idx] = action.payload;
          return;
        }
      }
    },
  },
});

// Экспорт экшенов
export const {
  // Доска
  setBoard,
  clearBoard,
  setLoading,
  setError,
  updateBoardName,
  updateBoardFields,

  //token
  setAuthToken,
  logout,
  
  // Пользователь
  setCurrentUser,
  clearCurrentUser,
  
  // Колонки
  addColumn,
  updateColumn,
  updateColumnsOrder,
  removeColumn,
  
  // Задачи
  addTask,
  updateTask,
  moveTask,
  removeTask,

  
  // Синхронизация
  syncBoard,
  syncTask,
} = boardSlice.actions;

export default boardSlice.reducer;