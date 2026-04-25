// frontend/src/pages/BoardPage.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setBoard, clearBoard, removeColumn, setLoading, setError,
  updateBoardName, removeTask, addTask, addColumn,
  updateColumnsOrder, updateTask as updateTaskAction,
  updateBoardFields, setCurrentUser, logout, updateColumn,
  updateTask, addTaskImage, deleteTaskImage
} from '../store/boardSlice';
import { BoardService, boardService } from '../services/board-service';
import { socketService } from '../socket/socket-service';
import Sidebar from '../components/Sidebar';
import DraggableColumn from '../components/DraggableColumn';
import { Board, BoardUser, Column, Column as ColumnType, Permission, Permission as PermissionEnum, Task, TaskImage } from '../../../shared/types';
import { authService } from '../services/auth-service';
//import { SocketTest } from '../components/socket-test';
import { current } from '@reduxjs/toolkit';

export const ItemTypes = { TASK: 'task', COLUMN: 'column' };

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  //локалстейты надо
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [boardUsers, setBoardUsers] = useState<BoardUser[]>([]);

  const moveTaskTimeoutRef = useRef<NodeJS.Timeout>();
const lastMoveTaskRef = useRef<{ taskId: number; targetIndex: number } | null>(null);

  const { currentBoard, currentUser, isLoading, error } = useAppSelector(state => state.board);

  const hasSubscribedRef = useRef(false);
  const lastBoardIdRef = useRef<string | null>(null);

  const currentBoardRef = useRef(currentBoard);
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    currentBoardRef.current = currentBoard;
    currentUserRef.current = currentUser; // ✅ Теперь работает
  }, [currentBoard, currentUser]);

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

  const handleUserKicked = useCallback((userId: number) => {
    if (currentUserRef.current?.userId === userId) {
      alert('Вы были исключены из доски владельцем!');
      navigate('/'); // Редирект на список досок
    }
  }, [navigate]);

  const handleUserRoleChanged = useCallback((userId: number, permission: BoardUser['permission']) => {
    console.log('🎯 CUSTOM HANDLER: user:roleChanged', { userId, permission });

    if (currentUserRef.current?.userId === userId) {

      alert(`Ваши права были изменены на: ${permission}`);
      dispatch(setCurrentUser({ ...currentUserRef.current, permission }));

    }
  }, [dispatch]);

  const handleTaskImageAdded = useCallback((data:{taskId: number, image: TaskImage}) => {
    console.log('🎯 CUSTOM HANDLER: task:image:added', data);

    //check if such image already exists in the task to avoid duplicates (can happen if user has multiple tabs open)
    const task = currentBoardRef.current?.columns.flatMap(col => col.tasks).find(t => t.id === data.taskId);
    if (task?.images?.find(img => img.id === data.image.id)) {
      console.log('Image already exists in task, skipping update');
      return;
    }

    dispatch(updateTask({
      taskId: data.taskId,
      updates: {
        images: [...(currentBoardRef.current?.columns.flatMap(col => col.tasks).find(t => t.id === data.taskId)?.images || []), data.image]
      }
    }));
    }, [dispatch]);

  const handleTaskImageUpdated = useCallback((data:{taskId: number, imageId: number, image: TaskImage}) => {
    console.log('🎯 CUSTOM HANDLER: task:image:updated', data);
    console.log('Current board state before image update:', currentBoardRef.current);
  }, [dispatch]);

  const handleTaskImageDeleted = useCallback((data:{taskId: number, imageId: number}) => {
    console.log('🎯 CUSTOM HANDLER: task:image:deleted', data);

    dispatch(updateTask({
      taskId: data.taskId,
      updates: {
        images: 
            currentBoardRef.current?.columns.flatMap(col => col.tasks).
              find(t => t.id === data.taskId)?.
              images?.filter(img => img.id !== data.imageId)
      }
    }));
  }, [dispatch]);

  // === Загрузка доски

 useEffect(() => {
  if (!boardId) return;
  
  // Если уже подписаны на эту доску, не делаем ничего
  if (lastBoardIdRef.current === boardId && hasSubscribedRef.current) {
    console.log('Already subscribed to board:', boardId);
    return;
  }

  const initBoard = async () => {
    try {
      dispatch(setLoading(true));
      
      // Загружаем доску
      const board = await boardService.getById(Number(boardId));
      dispatch(setBoard(board));
      
      const user = board.users?.find(u => u.userId === currentUser?.userId);
      if (user) dispatch(setCurrentUser(user));
      
      // Подключаемся к комнате через сокет
      socketService.joinBoard(Number(boardId));
      
      // Устанавливаем флаги
      hasSubscribedRef.current = true;
      lastBoardIdRef.current = boardId;
      
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to load board'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  initBoard();

  // Настраиваем подписки на сокеты
  const unsubscribes = [
    socketService.onTaskUpdated(handleTaskUpdated),
    socketService.onBoardUpdated(handleBoardUpdated),
    socketService.onBoardDeleted(handleBoardDeleted),
    socketService.onColumnCreated(handleColumnCreated),
    socketService.onColumnUpdated(handleColumnUpdated),
    socketService.onColumnDeleted(handleColumnDeleted),
    socketService.onTaskCreated(handleTaskCreated),
    socketService.onTaskDeleted(handleTaskDeleted),
    socketService.onUserRoleChanged(handleUserRoleChanged),
    socketService.onUserKicked(handleUserKicked),
    socketService.onTaskImageAdded(handleTaskImageAdded),
    socketService.onTaskImageUpdated(handleTaskImageUpdated),
    socketService.onTaskImageDeleted(handleTaskImageDeleted)
  ];

  // Cleanup при размонтировании или смене boardId
  return () => {
    console.log('Cleaning up board:', boardId);
    unsubscribes.forEach(unsub => unsub?.());
    
    // Сбрасываем флаги только при реальном уходе с доски
    hasSubscribedRef.current = false;
    lastBoardIdRef.current = null;
  };
}, [boardId, dispatch, 
  handleTaskUpdated, handleBoardUpdated, handleBoardDeleted,
  handleColumnCreated, handleColumnUpdated, handleColumnDeleted,
  handleTaskCreated, handleTaskDeleted, handleUserRoleChanged,
  handleUserKicked, handleTaskImageAdded, handleTaskImageUpdated,
  handleTaskImageDeleted
]);


//загрузка boardusers
useEffect(() => {
  const loadBoardUsers = async () => {
    if (!boardId) return;
    try {
      const users = await boardService.getByBoardId(Number(boardId));
      setBoardUsers(users);
    } catch (err) {
      console.error('Failed to load board users:', err);
    }
  };
  loadBoardUsers();
}, [boardId]);

  
  // === Обработчики CRUD (только HTTP, без socket.emit) ===

  const handleAddColumn = useCallback(async () => {
    console.log('trying to add column');

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
      
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to create column'));
    } finally {
      setIsAddingColumn(false);
    }
  }, [currentBoard, newColumnTitle, dispatch]);

const moveTask = useCallback(async (
  taskId: number,
  sourceColumnId: number,
  targetColumnId: number,
  targetIndex: number
) => {
  if (!currentBoard) return;
  
  // ✅ Проверка на дубликаты вызовов
  if (lastMoveTaskRef.current?.taskId === taskId && 
      lastMoveTaskRef.current?.targetIndex === targetIndex) {
    console.log('Duplicate moveTask call, skipping');
    return;
  }
  
  lastMoveTaskRef.current = { taskId, targetIndex };
  
  // ✅ Debounce для предотвращения множественных вызовов
  if (moveTaskTimeoutRef.current) {
    clearTimeout(moveTaskTimeoutRef.current);
  }
  
  moveTaskTimeoutRef.current = setTimeout(() => {
    const sourceColumn = currentBoard.columns.find(col => col.id === sourceColumnId);
    const task = sourceColumn?.tasks.find(tsk => tsk.id === taskId);
    
    if (!task) {
      console.error('Task not found');
      return;
    }

    if (sourceColumnId === targetColumnId) {
    const currentIndex = sourceColumn!.tasks.findIndex(t => t.id === taskId);
    // Корректируем targetIndex с учетом удаления
    const adjustedTargetIndex = currentIndex < targetIndex ? targetIndex - 1 : targetIndex;
    
    if (currentIndex === adjustedTargetIndex) {
      console.log('Position unchanged, skipping');
      return;
    }
  }
    
    const taskToMove = { ...task, columnId: targetColumnId };
    
    // Создаем глубокую копию колонок
    const updatedColumns = currentBoard.columns.map(col => ({
      ...col,
      tasks: col.tasks.map(t => ({ ...t }))
    }));
    
    if (sourceColumnId === targetColumnId) {
      // Перемещение внутри одной колонки
      const column = updatedColumns.find(col => col.id === targetColumnId);
      if (!column) return;
      
      // Удаляем задачу
      const tasksWithoutMoved = column.tasks.filter(t => t.id !== taskId);
      // Вставляем на новую позицию
      const newTasks = [
        ...tasksWithoutMoved.slice(0, targetIndex),
        taskToMove,
        ...tasksWithoutMoved.slice(targetIndex)
      ].map((t, idx) => ({ ...t, order: idx }));
      
      column.tasks = newTasks;
    } else {
      // Перемещение между колонками
      updatedColumns.forEach(col => {
        if (col.id === sourceColumnId) {
          col.tasks = col.tasks.filter(t => t.id !== taskId).map((t, idx) => ({ ...t, order: idx }));
        }
        if (col.id === targetColumnId) {
          const newTasks = [
            ...col.tasks.slice(0, targetIndex),
            taskToMove,
            ...col.tasks.slice(targetIndex)
          ].map((t, idx) => ({ ...t, order: idx }));
          col.tasks = newTasks;
        }
      });
    }
    
    // Обновляем Redux
    dispatch(updateColumnsOrder(updatedColumns));
    
    // Отправляем на сервер (может быть тяжелым, можно тоже задебаунсить)
    boardService.update(currentBoard.id, { columns: updatedColumns }).catch(err => {
      console.error('Failed to update board after moveTask:', err);
    });
    
  }, 100); // 100ms debounce
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

  const handleAddTask = useCallback(async (columnId: number, taskData: Omit<Task, 'id'>) => {
    if (!currentBoard) return;

    try {
      // Создаём задачу через HTTP
      const newTask = await boardService.createTask(currentBoard.id, columnId, taskData);
      
      // Добавляем в Redux
      dispatch(addTask({ columnId, task: newTask }));
    } 
    catch (err: any) {
      console.error('Failed to create task:', err);
      dispatch(setError(err.message || 'Failed to create task'));
    }
  }, [currentBoard, dispatch]);

  const handleDeleteTask = useCallback(async (columnId: number, taskId: number) => {
    if (!currentBoard)
      return;

    try {
      await boardService.deleteTask(currentBoard.id, columnId, taskId);

      dispatch(removeTask({columnId, taskId}));
    }
    catch (err: any){
      console.error('Failed to delete task:', err);
      dispatch(setError(err.message || 'Не удалось удалить задачу'));
    }
  }, [currentBoard, dispatch]);


  const handleBoardTitleChange = async (newName: string) => {
    if (!currentBoard) return;
    dispatch(updateBoardName(newName));
    //посылаем обновку на сервер
    console.log('trying to update boardTitle');
    try{await boardService.update(currentBoard.id, {name: newName});}
    catch (err : any)
    {
      alert("Не удалось изменить название борды");
    }    
  };

const handleAddTaskImage = useCallback(async (taskId: number, formData: FormData) => {
  if (!currentBoard) return;

  try {
    // HTTP-запрос на загрузку
    const newImage = await boardService.uploadTaskImage(currentBoard.id, taskId, formData);
    
    // Обновляем задачу в Redux: добавляем изображение в массив
    dispatch(updateTask({ 
      taskId, 
      updates: { 
        images: [...(currentBoard.columns.flatMap(col => col.tasks)
          .find(t => t.id === taskId)?.images || []), newImage] 
      } 
    }));
    
    // Бэкенд сам уведомит остальных через сокет
    
  } catch (err: any) {
    console.error('Failed to upload image:', err);
    dispatch(setError(err.message || 'Не удалось загрузить изображение'));
  }
}, [currentBoard, dispatch]);

  const handleDeleteTaskImage = useCallback(async (taskId: number, imageId: number) => {
  if (!currentBoard) return;

  try {
    // HTTP-запрос на удаление
    await boardService.deleteTaskImage(currentBoard.id, taskId, imageId);
    
    // Обновляем задачу в Redux: фильтруем массив изображений
    dispatch(updateTask({
      taskId,
      updates: {
        images: currentBoard.columns.flatMap(col => col.tasks)
          .find(t => t.id === taskId)?.images
          ?.filter(img => img.id !== imageId)
      }
    }));
    
  } catch (err: any) {
    console.error('Failed to delete image:', err);
    dispatch(setError(err.message || 'Не удалось удалить изображение'));
  }
}, [currentBoard, dispatch]);


  const handleDeleteColumn = useCallback(async (columnId: number) => {
    if (!currentBoard) return;
    if (!(currentUser?.permission === 'owner' || currentUser?.permission === 'edit')){
        alert('Не достаточно прав для удаления колонки!');
        return;
    }

    if (!window.confirm('Вы уверены что хотите удалить колонку?\nОтменить это действие будет невозможно'))
      return;
    try {
      // Создаём задачу через HTTP
      const deleteColumn = await boardService.deleteColumn(currentBoard.id, columnId);
      
      if (!deleteColumn)
        console.log('Колонка не была удалена!');

      // Добавляем в Redux
      dispatch(removeColumn(columnId));
    } 
    catch (err: any) {
      console.error('Failed to delete column:', err);
      dispatch(setError(err.message || 'Failed to delete column'));
    }
  }, [currentBoard, dispatch]);

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
          <button name='log-out-btn' onClick={handleLogout}>Выйти</button>
        </nav>
      </header>

      <div className="main-div">
        <Sidebar 
          boardId={currentBoard?.id || 0}
          currentUser={currentUser}
          boardUsers={boardUsers}
          onUsersChange={setBoardUsers}
        />
        
        <div className="work-space">

          {currentUser?.permission === 'owner' || currentUser?.permission === 'edit' 
            ? <h2 
            className="table-title-h2"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleBoardTitleChange(e.currentTarget.textContent || currentBoard.name)}
          >
            {currentBoard.name}
          </h2>
            : <h2 
            className="table-title-h2"
          >
            {currentBoard.name}
          </h2>
          }

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
                  onAddTask={handleAddTask}
                  onDeleteColumn={handleDeleteColumn}
                  onDeleteTask = {handleDeleteTask}
                  onAddTaskImage={handleAddTaskImage}
                  onDeleteTaskImage={handleDeleteTaskImage}
                />
              ))}
            
            {/*Кнопка добавления колонки */}
            {
              currentUser?.permission === 'owner' || currentUser?.permission === 'edit' 
              ? 
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
              : <></>
            }
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