// frontend/src/pages/BoardPage.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setBoard, 
  clearBoard, 
  setLoading, 
  setError,
  updateBoardName,
  removeTask,
  addTask,
  updateColumnsOrder,
  addColumn,
  updateTask as updateTaskAction,
  updateBoardFields,
  setCurrentUser,
  logout
} from '../store/boardSlice';
import { boardService } from '../services/board-service';
import { socketService } from '../socket/socket-service';
import Sidebar from '../components/Sidebar';
import DraggableColumn from '../components/DraggableColumn';
import { Column as ColumnType, Task } from '../../../shared/types';
import { authService } from '../services/auth-service';

export const ItemTypes = {
  TASK: 'task',
  COLUMN: 'column'
};

const BoardPage: React.FC = () => {
  console.log('Called board create');
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  console.log('Called selectors');
  const { currentBoard, currentUser, isLoading, error } = useAppSelector(state => state.board);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // Загрузка доски при монтировании
  useEffect(() => {
    console.log('loading board use effect called');
    if (!boardId) return;

    console.log('Trying to load board');
    const loadBoard = async () => {
      try {
        console.log('load board try block');
        dispatch(setLoading(true));
        const board = await boardService.getById(Number(boardId));
        dispatch(setBoard(board));
        
        // Найти текущего пользователя в списке участников
        const user = board.users.find(u => u.userId === currentUser?.userId);
        console.log('got user', user);
        if (user) {
          console.log('Dispatching setCurrentUser...', user);
          try {
            dispatch(setCurrentUser(user));
            console.log('✅ setCurrentUser dispatched successfully');
          } catch (e) {
            console.error('❌ Error in setCurrentUser:', e);
          }
        }
        
        console.log('joining socket');
        // Присоединиться к сокет-комнате
        socketService.joinBoard(Number(boardId));
        console.log('joined socket successfully');
      } catch (err: any) {
        console.log('got error', err);
        dispatch(setError(err.message || 'Failed to load board'));
      } finally {
        console.log('finally block joined');
        dispatch(setLoading(false));
      }
    };

    console.log('Called load board');
    loadBoard();

    // Подписка на socket-события
    const unsubscribeTask = socketService.onTaskUpdated((updatedTask) => {
      dispatch(updateTaskAction({ taskId: updatedTask.task.id, updates: updatedTask.task }));
    });

    const unsubscribeBoard = socketService.onBoardUpdated((updatedBoard) => {
      dispatch(updateBoardFields(updatedBoard.board));
    });

    // Очистка
    console.log('called return func');
    return () => {
      unsubscribeTask();
      unsubscribeBoard();
      //socketService.leaveBoard(Number(boardId));
      //dispatch(clearBoard());
    };
  }, [boardId, dispatch]);

  // === Обработчики ===

  const moveTask = useCallback((taskId: number, sourceColumnId: number, targetColumnId: number) => {
    if (!currentBoard) return;

    const sourceColumn = currentBoard.columns.find(col => col.id === sourceColumnId);
    const task = sourceColumn?.tasks.find(tsk => tsk.id === taskId);
    if (!task) return;

    const taskToMove = { ...task };
    const targetColumn = currentBoard.columns.find(col => col.id === targetColumnId);
    taskToMove.order = targetColumn ? targetColumn.tasks.length : 0;

    dispatch(removeTask({ columnId: sourceColumnId, taskId: task.id }));
    dispatch(addTask({ columnId: targetColumnId, task: taskToMove }));

    // Отправка на сервер для синхронизации
    socketService.updateTask(
      taskId,
      targetColumnId,
      currentBoard.id,
      {
        order: taskToMove.order
      }
    );
  }, [currentBoard, dispatch]);

  const moveColumn = useCallback((dragIndex: number, hoverIndex: number) => {
    if (!currentBoard) return;

    const sortedColumns = [...currentBoard.columns].sort((a, b) => (a.order || 0) - (b.order || 0));
    const newColumns = [...sortedColumns];
    const [removed] = newColumns.splice(dragIndex, 1);
    newColumns.splice(hoverIndex, 0, removed);

    const updatedColumns = newColumns.map((col, idx) => ({ ...col, order: idx }));
    dispatch(updateColumnsOrder(updatedColumns));
  }, [currentBoard, dispatch]);

  const handleUpdateTask = useCallback((columnId: number, updatedTask: Task) => {
    dispatch(updateTaskAction({ taskId: updatedTask.id, updates: updatedTask }));
    
    // Опционально: отправить на сервер
    if (currentBoard) {
      socketService.updateTask(
        updatedTask.id,
        columnId,
        currentBoard.id,
        updatedTask
      );
    }
  }, [dispatch, currentBoard]);

  const handleBoardTitleChange = (newName: string) => {
    if (!currentBoard) return;
    dispatch(updateBoardName(newName));
  };


 const handleLogout = () => {
  const confirmed = window.confirm('Вы уверены, что хотите выйти?');
    if (!confirmed) 
      return;
  
  console.log('🚪 Logging out...');

  socketService.disconnect();
  authService.clearToken();

  dispatch(logout());
  
  //Перенаправляем на страницу входа
  navigate('/login');
};

  const handleAddColumn = useCallback(async () => {
    if (!currentBoard || !newColumnTitle.trim()) return;

    try {
      setIsAddingColumn(true);
      
      // Определяем порядок (последняя колонка + 1)
      const maxOrder = currentBoard.columns.reduce(
        (max, col) => Math.max(max, col.order || 0), 
        -1
      );
      const newOrder = maxOrder + 1;

      // Создаём колонку на сервере
      const newColumn = await boardService.addColumn(currentBoard.id, {
        title: newColumnTitle.trim(),
        order: newOrder,
        tasks: []
      });

      // Добавляем в Redux
      dispatch(addColumn(newColumn));
      
      // Очищаем поле ввода
      setNewColumnTitle('');
      
      // Отправляем через сокет для синхронизации
      socketService.createColumn(currentBoard.id, newColumn);
      
    } catch (err: any) {
      console.error('Failed to create column:', err);
      dispatch(setError(err.message || 'Failed to create column'));
    } finally {
      setIsAddingColumn(false);
    }
  }, [currentBoard, newColumnTitle, dispatch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddColumn();
    }
  };


  //const handleColumnDelete = () => {};

  //const handleTaskCreate = () => {};
  //const handleTaskDelete = () => {};

  // === Рендеринг ===

  if (isLoading) return <div className="loading">Загрузка доски...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;
  if (!currentBoard) return <div className="error">Доска не найдена</div>;

  return (
    <div className="App">
      <header>
        <h1 className="header-logo">Kan-do-it</h1>
        <nav>
          <span>{currentUser?.userName ?? "Гость"}</span>
          <button name='log-out-btn' onClick={handleLogout}>Выйти</button>
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
                  column={column}
                  index={index}
                  boardId={currentBoard.id}
                  onMoveTask={moveTask}
                  onMoveColumn={moveColumn}
                  onUpdateTask={handleUpdateTask}
                />
              ))}
          </div>
        </div>
      </div>

      <footer>
        <div>Design, develop, test by @DmitryFromFIb. 2026</div>
      </footer>
    </div>
  );
};

export default BoardPage;