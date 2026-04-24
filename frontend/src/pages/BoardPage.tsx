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
import { SocketTest } from '../components/socket-test';
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

  const { currentBoard, currentUser, isLoading, error } = useAppSelector(state => state.board);

  const hasSubscribedRef = useRef(false);
  const lastBoardIdRef = useRef<string | null>(null);


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
    if (currentUser?.userId === userId) {
      alert('Вы были исключены из доски владельцем!');
      navigate('/'); // Редирект на список досок
    }
  }, [navigate]);

  const handleUserRoleChanged = useCallback((userId: number, permission: BoardUser['permission']) => {
    if (currentUser?.userId === userId) {

      alert(`Ваши права были изменены на: ${permission}`);
      dispatch(setCurrentUser({ ...currentUser, permission }));

    }
  }, [currentUser, dispatch]);

  // === Загрузка доски

  useEffect(() => {
  if (!boardId || hasSubscribedRef.current) return;
  hasSubscribedRef.current = true;

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
      socketService.onUserKicked(handleUserKicked)
    ];

    return () => {
      console.log('🧹 Cleanup called for board:', boardId);
      // ✅ Сбрасываем флаг только если это та же доска
      if (lastBoardIdRef.current === boardId) {
        hasSubscribedRef.current = false;
      }
      unsubscribes.forEach(unsub => unsub?.());
    };
}, [boardId, dispatch, currentUser?.userId]); 


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

  const moveTask = useCallback(async (taskId: number, sourceColumnId: number, targetColumnId: number) => {
  if (!currentBoard) return;

  const sourceColumn = currentBoard.columns.find(col => col.id === sourceColumnId);
  const task = sourceColumn?.tasks.find(tsk => tsk.id === taskId);
  if (!task) {
    console.error('Task not found:', { taskId, sourceColumnId });
    return;
  }

  const taskToMove = { 
    ...task, 
    columnId: targetColumnId  // ← Критически важно!
  };

  const updatedColumns = currentBoard.columns.map(col => {
    // Удаляем задачу из исходной колонки (если это не та же колонка)
    if (col.id === sourceColumnId && sourceColumnId !== targetColumnId) {
      return {
        ...col,
        tasks: col.tasks
          .filter(t => t.id !== taskId)
          .map((t, idx) => ({ ...t, order: idx }))
      };
    }
    
    // Добавляем задачу в целевую колонку
    if (col.id === targetColumnId) {
      // Если перемещаем внутри той же колонки — сначала удаляем со старой позиции
      const tasksForTarget = sourceColumnId === targetColumnId 
        ? col.tasks.filter(t => t.id !== taskId)
        : col.tasks;
      
      return {
        ...col,
        tasks: [...tasksForTarget, taskToMove].map((t, idx) => ({ ...t, order: idx }))
      };
    }
    
    return col;
  });

  // ✅ Оптимистичное обновление Redux
  dispatch(removeTask({ columnId: sourceColumnId, taskId }));
  dispatch(addTask({ columnId: targetColumnId, task: taskToMove }));

  // ✅ Синхронизация с бэкендом
  boardService.update(currentBoard.id, { columns: updatedColumns });

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