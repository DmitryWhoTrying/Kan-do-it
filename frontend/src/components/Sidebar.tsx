import React, { useState } from 'react';

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div id="sidebar" className={isExpanded ? 'expanded' : ''}>
      <button className="toggle-btn" onClick={toggleMenu}>
        <span className="icon">☰</span>
        <span className="text">Свернуть</span>
      </button>
      
      <div className="menu-item">
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
    </div>
  );
};

export default Sidebar;