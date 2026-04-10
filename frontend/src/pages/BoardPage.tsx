// frontend/src/pages/BoardPage/BoardPage.tsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setBoard, 
  addColumn, 
  moveTask, 
  setCurrentUser,
  syncTask, setLoading, setError,
  clearBoard,
  updateBoardFields
} from '../store/boardSlice';
import { socketService } from '../../socket/socket-service';
import { AppDispatch, RootState } from '../store';
import { BoardService } from '../services/board-service';

import { useAppDispatch, useAppSelector } from '../store/hooks';

export const BoardPage = ({ boardId, userId }: { boardId: number; userId: number }) => {
  const dispatch = useAppDispatch();
  const { currentBoard, currentUser, isLoading } = useSelector((state: RootState) => state.board);
  const boardService = new BoardService();

  // Загрузка доски при монтировании
  useEffect(() => {
    dispatch(setLoading(true));
    
    boardService.getById(boardId)
      .then(board => {
        dispatch(setBoard(board));
        // Находим текущего пользователя в списке
        const user = board.users.find(u => u.userId === userId);
        if (user) dispatch(setCurrentUser(user));
      })
      .catch(err => dispatch(setError(err.message)))
      .finally(() => dispatch(setLoading(false)));

    // Подписка на socket-события
    socketService.onTaskUpdated((updatedTask) => {
      dispatch(syncTask(updatedTask.task));
    });

    socketService.onBoardUpdated((updatedBoard) => {
      dispatch(updateBoardFields(updatedBoard.board));
    });

    return () => {
      socketService.off('task:updated');
      socketService.off('board:updated');
      dispatch(clearBoard());
    };
  }, [boardId, userId, dispatch]);

  // Обработчик Drag-n-Drop
  const handleDragEnd = (taskId: number, fromColumnId: number, toColumnId: number, newOrder: number) => {
    // 1. Оптимистичное обновление локального стейта
    dispatch(moveTask({ taskId, fromColumnId, toColumnId, newOrder }));
    
    // 2. Отправка на сервер для синхронизации
    socketService.updateTask(taskId, toColumnId, boardId, {order: newOrder});
  };

  if (isLoading) return <div>On loading...</div>;
  if (!currentBoard) return <div>Error 404, board not...</div>;

  // return (
  //   <Board 
  //     board={currentBoard} 
  //     permission={currentUser?.permission}
  //     onDragEnd={handleDragEnd}
  //   />
  // );
};