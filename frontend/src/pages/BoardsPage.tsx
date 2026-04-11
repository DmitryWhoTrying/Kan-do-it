// frontend/src/pages/BoardsPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { boardService } from '../services/board-service';
import { Board } from '../../../shared/types';
import { socketService } from '../socket/socket-service';
import { authService } from '../services/auth-service';
import { logout } from '../store/boardSlice';


const BoardsPage: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const currentUser = useAppSelector(state => state.board.currentUser);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadBoards = async () => {
      try {
        console.log("Tryin to load boards page");
        setLoading(true);
        // Загружаем доски, где пользователь является участником
        console.log("Tryin to load boards of user", currentUser);
        const userBoards = await boardService.getByUser(currentUser?.userId || -1);
        console.log("got boards", userBoards);
        setBoards(userBoards);
      } catch (err: any) {
        setError(err.message || 'Failed to load boards');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.userId) {
      loadBoards();
    }
  }, [currentUser?.userId]);

  const handleCreateBoard = async () => {
    const name = prompt('Название новой доски:');
    if (!name || !currentUser) return;

    try {
      const newBoard = await boardService.create({
        id: -1,
        name,
        users: [{
          boardId: -1, // будет установлен на бэке
          userId: currentUser.userId,
          userName: currentUser.userName,
          permission: 'owner'
        }],
        columns:[]
      });
      navigate(`/board/${newBoard.id}`);
    } catch (err) {
      alert('Не удалось создать доску' + err);
    }
  };

  const handleLogOut = async()=> {
    const confirmed = window.confirm('Вы уверены, что хотите выйти?');
    if (!confirmed) 
      return;

    socketService.disconnect();
    authService.clearToken();

    dispatch(logout());

    navigate('/login');
  }

  if (loading) return <div>Загрузка досок...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="boards-page">
      <header>
        <h1>Kan-do-it</h1>
        <nav>
          <span>{currentUser?.userName}</span>
          <button onClick={handleLogOut}>Выйти</button>
        </nav>
      </header>

      <main className="boards-list">
        <div className="boards-header">
          <h2>Мои доски</h2>
          <button onClick={handleCreateBoard}>+ Новая доска</button>
        </div>

        <div className="boards-grid">
          {boards.map(board => (
            <div 
              key={board.id} 
              className="board-card"
              onClick={() => navigate(`/board/${board.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/board/${board.id}`)}
            >
              <h3>{board.name}</h3>
              <p>{board.columns.length} колонок • {board.users.length} участников</p>
            </div>
          ))}
          
          {boards.length === 0 && (
            <div className="empty-state">
              <p>У вас пока нет досок</p>
              <button onClick={handleCreateBoard}>Создать первую</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BoardsPage;