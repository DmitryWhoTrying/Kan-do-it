// frontend/src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { store, AppDispatch, RootState } from './store';
import { setCurrentUser, setAuthToken, logout, clearBoard } from './store/boardSlice';
import { authService } from './services/auth-service';
import { socketService } from '../src/socket/socket-service';
import apiClient from './services/api';

// Страницы
import LoginPage from './pages/LoginPage';
import BoardsPage from './pages/BoardsPage';
import BoardPage from './pages/BoardPage';

// Глобальные стили
import './App.css';


// Компонент защиты маршрутов (редирект на логин, если нет пользователя)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = useSelector((state: RootState) => state.board.currentUser);
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Компонент инициализации приложения (восстановление сессии)
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.board.currentUser);

  // Слушаем событие разавторизации от api.ts (при 401 ошибке)
  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logout());
      authService.clearToken();
      socketService.disconnect();
      navigate('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [dispatch, navigate]);

  // Восстановление сессии при загрузке приложения
  useEffect(() => {
    const initializeApp = async () => {
      const token = authService.getToken();
      
      if (token && !currentUser) {
        // просто восстанавливаем пользователя из токена
        // В реальном проекте здесь был бы запрос /api/auth/me
        const tokenParts = token.split('_');
        if (tokenParts.length >= 3) {
          const userId = parseInt(tokenParts[2]);
          const userName = localStorage.getItem('lastUsername') || 'User';
          
          dispatch(setCurrentUser({
            boardId: -1,
            userId,
            userName,
            permission: 'owner'
          }));
          dispatch(setAuthToken(token));
          
          // Инициализируем сокет
          socketService.connect(userId);
        }
      }
    };

    initializeApp();
  }, [dispatch, currentUser]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  return <>{children}</>;
};

// Основной компонент приложения с роутингом
const AppContent: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <AppInitializer>
        <BrowserRouter>
          <Routes>
            {/* === Публичные маршруты === */}
            <Route 
              path="/login" 
              element={<LoginPage />} 
            />
            
            {/* === Защищённые маршруты === */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <BoardsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/board/:boardId" 
              element={
                <ProtectedRoute>
                  <BoardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* === Обработка несуществующих маршрутов === */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </BrowserRouter>
      </AppInitializer>
    </DndProvider>
  );
};

export default AppContent;