import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { boardService } from '../services/board-service';
import { BoardUser } from '../../../shared/types';

export interface SidebarProps {
  boardId: number;
  currentUser: BoardUser | null;
  boardUsers: BoardUser[];
  onUsersChange?: (users: BoardUser[]) => void; // Опциональный колбэк для обновления стейта в родителе
}

const PERMISSIONS = [
  { value: 'owner', label: '👑 Владелец', color: '#f57f17' },
  { value: 'edit', label: '✏️ Редактор', color: '#1976d2' },
  { value: 'drag-n-drop', label: '🖱️ Drag&Drop', color: '#388e3c' },
  { value: 'view-only', label: '👁️ Просмотр', color: '#616161' },
] as const;

type PermissionValue = typeof PERMISSIONS[number]['value'];

const Sidebar: React.FC<SidebarProps> = ({
  boardId,
  currentUser,
  boardUsers,
  onUsersChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const [isUsersExpanded, setIsUsersExpanded] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUserPermission, setNewUserPermission] = useState<PermissionValue>('view-only');
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentUser?.permission === 'owner';

  const navigate = useNavigate();

  const {currentBoard} = useAppSelector((state) =>  state.board);

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

    if (isExpanded && isUsersExpanded)
      setIsUsersExpanded(!isUsersExpanded);
  };

  const toggleUserExpand = () => {
    setIsUsersExpanded(!isUsersExpanded);

    //если основа не открыта, а подпространство пытается раскрыться
    if (!isUsersExpanded && !isExpanded)
      setIsExpanded(!isExpanded);
  };

  const handleRemoveUser = useCallback(async (userId: number, userName: string) => {
    if (!isOwner) return;
    if (userId === currentUser?.userId) {
      setError('Нельзя удалить самого себя');
      return;
    }

    if (!window.confirm(`Удалить пользователя "${userName}" из доски?`)) {
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, [userId]: true }));
      setError(null);

      // HTTP-запрос на удаление
      await boardService.removeUser(boardId, userId);

      //Обновляем локальный стейт
      const updatedUsers = boardUsers.filter(u => u.userId !== userId);
      onUsersChange?.(updatedUsers);

    } catch (err: any) {
      console.error('Failed to remove user:', err);
      setError(err.message || 'Не удалось удалить пользователя');
    } finally {
      setIsLoading(prev => ({ ...prev, [userId]: false }));
    }
  }, [isOwner, currentUser?.userId, boardId, boardUsers, onUsersChange]);

  const handleChangePermission = useCallback(async (userId: number, newPermission: PermissionValue) => {
    if (!isOwner) return;
    if (!currentBoard)
      return;

    try {
      setIsLoading(prev => ({ ...prev, [userId]: true }));
      setError(null);

      // HTTP-запрос на обновление прав
      await boardService.updateUserPermission(currentBoard?.id, userId, newPermission);

      // Обновляем локальный стейт
      const updatedUsers = boardUsers.map(u => 
        u.userId === userId ? { ...u, permission: newPermission } : u
      );
      onUsersChange?.(updatedUsers);

    } catch (err: any) {
      console.error('Failed to update permission:', err);
      setError(err.message || 'Не удалось изменить права');
    } finally {
      setIsLoading(prev => ({ ...prev, [userId]: false }));
    }
  }, [isOwner, currentBoard?.id, boardUsers, onUsersChange]);

  const handleAddUser = useCallback(async () => {
    if (!isOwner || !newUsername.trim()) return;
    if (!currentBoard) return;

    try {
      setIsLoading(prev => ({ ...prev, add: true }));
      setError(null);

      // HTTP-запрос на добавление
      const addedUser = await boardService.addBoardUserByName(currentBoard?.id,
        newUsername.trim(),
        newUserPermission,
      );

      const updatedUsers = [...boardUsers, addedUser];
      onUsersChange?.(updatedUsers);

      // Сброс формы
      setNewUsername('');
      setNewUserPermission('view-only');
      setIsAddingUser(false);

      // Уведомляем через сокет
      //socketService.emitUserAdded?.(boardId, addedUser);

    } catch (err: any) {
      console.error('Failed to add user:', err);
      setError(err.message || 'Пользователь не найден или уже в доске');
    } finally {
      setIsLoading(prev => ({ ...prev, add: false }));
    }
  }, [isOwner, newUsername, newUserPermission, boardId, boardUsers, onUsersChange]);


  const handleAddUserKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAddUser();
      } else if (e.key === 'Escape') {
        setIsAddingUser(false);
        setNewUsername('');
      }
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

      {/* === Секция пользователей === */}
        <div className="menu-item users-section"
          onClick={() => toggleMenu}>
          {/* Заголовок с кнопкой раскрытия */}
          <button 
            className="users-header"
            onClick={toggleUserExpand}
            type="button"
          >
            <span className="icon">👥</span>
            <span className="text">Пользователи</span>
            <span className="users-count" 
                  style={{display: isExpanded ? 'inline' : 'none'}}>
                    {boardUsers.length}</span>
            <span className={`toggle-icon ${isUsersExpanded ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>

          {/* Раскрывающийся список */}
          {isUsersExpanded && (
            <div className="users-list">
              {/* Ошибка */}
              {error && <div className="users-error"><p>Пользователь не найден</p><p>или уже добавлен!</p></div>}

              {/* Список пользователей */}
              {boardUsers
                .slice()
                .sort((a, b) => {
                  // Сначала владелец, потом по имени
                  if (a.permission === 'owner') return -1;
                  if (b.permission === 'owner') return 1;
                  return a.userName?.localeCompare(b.userName ?? '') ?? 1;
                })
                .map(user => (
                  <div key={user.userId} className="user-item">
                    {/* Имя и бейдж прав */}
                    <div className="user-info">
                      <span className="user-name" title={user.userName}>
                        {user.userName}
                        {user.userId === currentUser?.userId && ' (вы)'}
                      </span>
                      <span 
                        className="user-permission-badge"
                        style={{ 
                          backgroundColor: PERMISSIONS.find(p => p.value === user.permission)?.color + '20',
                          color: PERMISSIONS.find(p => p.value === user.permission)?.color,
                        }}
                      >
                        {PERMISSIONS.find(p => p.value === user.permission)?.label}
                      </span>
                    </div>

                    {/* Элементы управления (только для владельца) */}
                    {isOwner && user.userId !== currentUser?.userId && (
                      <div className="user-actions">
                        {/* Dropdown для смены прав */}
                        <select
                          className="permission-select"
                          value={user.permission}
                          onChange={(e) => handleChangePermission(user.userId, e.target.value as PermissionValue)}
                          disabled={isLoading[user.userId]}
                        >
                          {PERMISSIONS.map(p => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>

                        {/* Кнопка удаления */}
                        <button
                          className="btn-remove-user"
                          onClick={() => handleRemoveUser(user.userId, user.userName ?? '')}
                          disabled={isLoading[user.userId]}
                          title="Удалить из доски"
                        >
                          {isLoading[user.userId] ? '⏳' : '✕'}
                        </button>
                      </div>
                    )}

                    {/* Индикатор загрузки */}
                    {isLoading[user.userId] && (
                      <span className="user-loading">⏳</span>
                    )}
                  </div>
                ))}

              {/* Кнопка добавления пользователя (только для владельца) */}
              {isOwner && (
                <div className="add-user-section">
                  {isAddingUser ? (
                    <div className="add-user-form">
                      <input
                        type="text"
                        placeholder="Имя пользователя"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        onKeyDown={handleAddUserKeyDown}
                        className="add-user-input"
                        autoFocus
                        list="known-users" // Опционально: datalist с подсказками
                      />
                      
                      <select
                        value={newUserPermission}
                        onChange={(e) => setNewUserPermission(e.target.value as PermissionValue)}
                        className="add-user-permission"
                      >
                        {PERMISSIONS.map(p => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>

                      <div className="add-user-actions">
                        <button
                          onClick={handleAddUser}
                          disabled={!newUsername.trim()}
                          className="btn-add-user-confirm"
                        >
                          {isLoading ? 'Добавление...' : 'Добавить'}
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingUser(false);
                            setNewUsername('');
                          }}
                          className="btn-add-user-cancel"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingUser(true)}
                      className="btn-add-user-toggle"
                    >
                      + Пригласить участника
                    </button>
                  )}
                </div>
              )}

              {/* Подсказка для не-владельцев */}
              {!isOwner && boardUsers.length > 0 && (
                <small className="users-hint">
                  Управление участниками доступно только владельцу доски
                </small>
              )}
            </div>
          )}
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