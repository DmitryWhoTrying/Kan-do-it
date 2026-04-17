// frontend/src/pages/BoardPage.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setBoard, clearBoard, removeColumn, setLoading, setError,
  updateBoardName, removeTask, addTask, addColumn,
  updateColumnsOrder, updateTask as updateTaskAction,
  updateBoardFields, setCurrentUser, logout, updateColumn,
  updateTask
} from '../store/boardSlice';
import { BoardService, boardService } from '../services/board-service';
import { socketService } from '../socket/socket-service';
import Sidebar from '../components/Sidebar';
import DraggableColumn from '../components/DraggableColumn';
import { Board, Column, Column as ColumnType, Task } from '../../../shared/types';
import { authService } from '../services/auth-service';
import { SocketTest } from '../components/socket-test';

export const ItemTypes = { TASK: 'task', COLUMN: 'column' };

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentBoard, currentUser, isLoading, error } = useAppSelector(state => state.board);


   const hasSubscribedRef = useRef(false);
  const lastBoardIdRef = useRef<string | null>(null);

  // Состояние для добавления колонки
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const handleTaskUpdated = useCallback((payload: { task: Task }) => {
    dispatch(updateTaskAction({ 
      taskId: payload.task.id, 
      updates: payload.task 
    }));
  }, [dispatch]); // ✅ Только необходимые зависимости

  const handleBoardUpdated = useCallback((board: Board) => {
    console.log('📡 Received board update:', board);
    dispatch(updateBoardFields(board));
  }, [dispatch]);

  const handleBoardDeleted = useCallback((boardId: number) => {
    alert('Доска была удалена её владельцем!');
    navigate('/'); // ✅ Редирект на список досок
  }, [navigate]);

  const handleColumnCreated = useCallback((column: Column) => {
    console.log('🎯 CUSTOM HANDLER: column:created');
    dispatch(addColumn(column));
  }, [dispatch]);

  const handleColumnUpdated = useCallback((column: Column) => {
    console.log('🎯 CUSTOM HANDLER: column:updated');
    dispatch(updateColumn(column));
  }, [dispatch]);

  const handleColumnDeleted = useCallback((columnId: number) => {
    dispatch(removeColumn(columnId));
  }, [dispatch]);

  const handleTaskCreated = useCallback((data: { columnId: number; task: Task }) => {
    dispatch(addTask(data));
  }, [dispatch]);

  const handleTaskDeleted = useCallback((data: { taskId: number; columnId: number; boardId: number }) => {
    dispatch(removeTask(data));
  }, [dispatch]);

  // === Загрузка доски

  useEffect(() => {
  if (!boardId) return;

  const loadBoard = async () => {
    try {
      dispatch(setLoading(true));
      const board = await boardService.getById(Number(boardId));
      dispatch(setBoard(board));
      
      const user = board.users?.find(u => u.userId === currentUser?.userId);
      if (user) dispatch(setCurrentUser(user));
      
      socketService.joinBoard(Number(boardId));
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to load board'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  loadBoard();
}, [boardId, dispatch]); 

  // 
  // и подписка на сокеты ===
  useEffect(() => {
    // ✅ Защита от повторного запуска
    if (!boardId || hasSubscribedRef.current) {
      console.log('⏭️ Skipping subscription:', { 
        hasSubscribed: hasSubscribedRef.current,
        boardId,
        currentBoardId: currentBoard?.id 
      });
      return;
    }

    console.log('🔌 FIRST TIME: Setting up socket subscriptions for board:', boardId);
    hasSubscribedRef.current = true;
    lastBoardIdRef.current = boardId;

    const loadBoard = async () => {
      try {
        dispatch(setLoading(true));
        const board = await boardService.getById(Number(boardId));
        dispatch(setBoard(board));
        
        const user = board.users?.find(u => u.userId === currentUser?.userId);
        if (user && user.userId !== currentUser?.userId) {
          dispatch(setCurrentUser(user));
        }
        
        socketService.joinBoard(Number(boardId));
      } catch (err: any) {
        dispatch(setError(err.message || 'Failed to load board'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadBoard();

    const unsubscribes = [
      socketService.onTaskUpdated(handleTaskUpdated),
      socketService.onBoardUpdated(handleBoardUpdated),
      socketService.onBoardDeleted(handleBoardDeleted),
      socketService.onColumnCreated(handleColumnCreated),
      socketService.onColumnUpdated(handleColumnUpdated),
      socketService.onColumnDeleted(handleColumnDeleted),
      socketService.onTaskCreated(handleTaskCreated),
      socketService.onTaskDeleted(handleTaskDeleted),
    ];

    return () => {
      console.log('🧹 Cleanup called for board:', boardId);
      // ✅ Сбрасываем флаг только если это та же доска
      if (lastBoardIdRef.current === boardId) {
        hasSubscribedRef.current = false;
      }
      unsubscribes.forEach(unsub => unsub?.());
    };
  }, [boardId, dispatch /* убрали хендлеры из зависимостей */]);

  // === Обработчики CRUD (только HTTP, без socket.emit) ===

  const handleAddColumn = useCallback(async () => {
    if (!currentBoard || !newColumnTitle.trim()) return;

    try {
      setIsAddingColumn(true);
      
      const maxOrder = Math.max(-1, ...currentBoard.columns.map(c => c.order || 0));
      
      // Только HTTP-запрос — бэкенд сам уведомит через сокет
      const newColumn = await boardService.addColumn(currentBoard.id, {
        title: newColumnTitle.trim(),
        order: maxOrder + 1,
        tasks: []
      });

      dispatch(addColumn(newColumn));
      setNewColumnTitle('');
      // НЕ вызываем socketService.createColumn() — бэкенд сам сделает emit
      
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to create column'));
    } finally {
      setIsAddingColumn(false);
    }
  }, [currentBoard, newColumnTitle, dispatch]);

  const moveTask = useCallback((taskId: number, sourceColumnId: number, targetColumnId: number) => {
    if (!currentBoard) return;

    const sourceColumn = currentBoard.columns.find(col => col.id === sourceColumnId);
    const task = sourceColumn?.tasks.find(tsk => tsk.id === taskId);
    if (!task) return;

    const taskToMove = { ...task };
    const targetColumn = currentBoard.columns.find(col => col.id === targetColumnId);
    taskToMove.order = targetColumn ? targetColumn.tasks.length : 0;

    // Оптимистичное обновление локального стейта
    dispatch(removeTask({ columnId: sourceColumnId, taskId: task.id }));
    dispatch(addTask({ columnId: targetColumnId, task: taskToMove }));

    // Только HTTP — бэкенд уведомит остальных
    boardService.updateTask(currentBoard.id, targetColumnId, taskId, { order: taskToMove.order });

  }, [currentBoard, dispatch]);

  const moveColumn = useCallback((dragIndex: number, hoverIndex: number) => {
    if (!currentBoard) return;

    const sorted = [...currentBoard.columns].sort((a, b) => (a.order || 0) - (b.order || 0));
    const [moved] = sorted.splice(dragIndex, 1);
    sorted.splice(hoverIndex, 0, moved);
    
    const updated = sorted.map((col, idx) => ({ ...col, order: idx }));
    dispatch(updateColumnsOrder(updated));
    
    //new order (optional)
    boardService.update(currentBoard.id, {columns:updated});
  }, [currentBoard, dispatch]);

  const handleUpdateTask = useCallback((columnId: number, updatedTask: Task) => {
    // Оптимистичное обновление
    dispatch(updateTaskAction({ taskId: updatedTask.id, updates: updatedTask }));
    
    // Синхронизация с сервером через HTTP
    if (currentBoard) {
      boardService.updateTask(currentBoard.id, columnId, updatedTask.id, updatedTask);
    }
  }, [dispatch, currentBoard]);

  const handleBoardTitleChange = (newName: string) => {
    if (!currentBoard) return;
    dispatch(updateBoardName(newName));
    //посылаем обновку на сервер
    console.log('trying to update boardTitle');
    try{boardService.update(currentBoard.id, {name: newName});}
    catch (err : any)
    {
      alert("Не удалось изменить название борды");
    }    
  };

  const handleLogout = () => {
    if (!window.confirm('Вы уверены, что хотите выйти?')) return;
    
    socketService.disconnect();
    authService.clearToken();
    dispatch(logout());
    navigate('/login');
  };

  // === Рендеринг ===
  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;
  if (!currentBoard) return <div className="error">Доска не найдена</div>;

  return (
    <div className="App">
      <header>
        <h1 className="header-logo">Kan-do-it</h1>
        <nav>
          <span>{currentUser?.userName ?? "guest"}</span>
          <button onClick={handleLogout}>Выйти</button>
        </nav>
      </header>

      <div className="main-div">
        <Sidebar />
        
        <div className="work-space">
          <h2 
            className="table-title-h2"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleBoardTitleChange(e.currentTarget.textContent || currentBoard.name)}
          >
            {currentBoard.name}
          </h2>

          <div className="columns">
            {currentBoard.columns
              .slice()
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((column: ColumnType, index: number) => (
                <DraggableColumn
                  key={column.id}
                  index={index}
                  column={column}
                  boardId={currentBoard.id}
                  onMoveTask={moveTask}
                  onMoveColumn={moveColumn}
                  onUpdateTask={handleUpdateTask}
                />
              ))}
            
            {/* ✅ Кнопка добавления колонки */}
            <div className="add-column">
              {isAddingColumn ? (
                <div className="add-column-form">
                  <input
                    type="text"
                    placeholder="Название колонки"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                    autoFocus
                    className="column-input"
                  />
                  <div className="add-column-actions">
                    <button 
                      onClick={handleAddColumn}
                      disabled={!newColumnTitle.trim() || isAddingColumn}
                      className="btn-add"
                    >
                      Добавить
                    </button>
                    <button 
                      onClick={() => { setNewColumnTitle(''); setIsAddingColumn(false); }}
                      className="btn-cancel"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingColumn(true)}
                  className="btn-add-column"
                >
                  + Добавить колонку
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div>Design, develop, test by @DmitryFromFIb. 2026</div>
      </footer>
    </div>
  );
  //{<SocketTest />};
};

export default BoardPage;