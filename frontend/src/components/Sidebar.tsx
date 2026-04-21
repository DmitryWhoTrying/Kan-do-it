import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { boardService } from '../services/board-service';

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const navigate = useNavigate();

  const {currentUser, currentBoard} = useAppSelector((state) =>  state.board);

  const handleBoardDelete = () => {
    if (!currentBoard)
      return;

    if (currentUser?.permission !== 'owner'){
      alert('Только владелец доски может её удалить!');
      return;
    }
    if (!window.confirm('Вы ТОЧНО хотите удалить доску?\nОтменить это действие будет невозможно!'))
      return;

    boardService.delete(currentBoard?.id);
    navigate('/');
  }

  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div id="sidebar" className={isExpanded ? 'expanded' : ''}>
      <button className="toggle-btn" onClick={toggleMenu}>
        <span className="icon">☰</span>
        <span className="text">Свернуть</span>
      </button>
      
      <div 
        className="menu-item" 
        onKeyDown={(e)=> e.key === 'Enter' && navigate(`/boards/`)}
        onClick={() => navigate('/boards/')}
        >
        <span className="icon">🏠</span>
        <span className="text">Доски</span>
      </div>
      <div className="menu-item">
        <span className="icon">👁️‍🗨️</span>
        <span className="text">Пользователи</span>
      </div>
      <div className="menu-item">
        <span className="icon">⚙️</span>
        <span className="text">Настройки</span>
      </div>
      <div className="menu-item">
        <span className="icon">📧</span>
        <span className="text">Поделиться доской</span>
      </div>
      <div className="menu-item">
        <span className="icon">🪄</span>
        <span className="text">O разработчике</span>
      </div>
      <div className="menu-item"
        onClick={handleBoardDelete}>
        <span className="icon">❌</span>
        <span className="text">Удалить доску</span>
      </div>
    </div>
  );
};

export default Sidebar;