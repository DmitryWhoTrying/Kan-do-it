// frontend/src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCurrentUser, setAuthToken, clearBoard } from '../store/boardSlice';
import { authService } from '../services/auth-service';
import { socketService } from '../socket/socket-service';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Если пользователь уже авторизован — редирект на доски
  const currentUser = useAppSelector(state => state.board.currentUser);
  
  useEffect(() => {
    const token = authService.getToken();
    if (token && currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    console.log('Set states successfully');

    try {
      // Вызов сервиса аутентификации
      const { user, token } = await authService.loginOrRegister({ 
        username, 
        password // Отправляем, даже если бэкенд игнорирует
      });

      console.log('Called auth service successfully');

      // Сохраняем токен
      authService.saveToken(token);
      
      console.log(user);

      // Обновляем Redux-стейт
      dispatch(setCurrentUser({
        boardId: -1, // Будет установлен при выборе доски
        userId: user.id,
        userName: user.name,
        permission: 'owner' // По умолчанию — владелец
      }));
      
      dispatch(setAuthToken(token));

      // Инициализируем сокет с новым userId
      socketService.connect(user.id);
      
      // Редирект на список досок
      navigate('/');
      
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Не удалось войти');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // Быстрый вход для тестирования
    setUsername(`guest_${Math.random().toString(36).slice(2, 8)}`);
    setPassword('demo');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="logo">Kan-do-it</h1>
        <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имя пользователя</label>
            <input
              type="text"
              placeholder="Введите имя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // 🔸 В учебном режиме можно сделать необязательным
              required={false}
              disabled={isLoading}
            />
            <small className="hint">В демо-режиме пароль не проверяется</small>
          </div>
          
          <button type="submit" disabled={isLoading || !username.trim()}>
            {isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>
        
        <div className="login-options">
          <button 
            type="button" 
            className="toggle-mode"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            disabled={isLoading}
          >
            {isLogin 
              ? 'Нет аккаунта? Создать' 
              : 'Уже есть аккаунт? Войти'}
          </button>
          
          <button 
            type="button" 
            className="guest-login"
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            🎭 Войти как гость
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;