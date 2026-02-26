import { configureStore } from '@reduxjs/toolkit';
import boardsReducer from './boardSlice';

export const store = configureStore({
  reducer: {
    boards: boardsReducer,
  },
});

// Типизация для хуков
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;