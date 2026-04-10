import React, { useState, useCallback, useEffect } from 'react';
import '../src/App.css';
import Sidebar from './components/Sidebar';
import DraggableColumn from './components/DraggableColumn';
import { Task as TaskType, Column as ColumnType, Board, Task } from '../../shared/types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { addTask, updateBoardName, updateBoardFields, removeColumn, removeTask, updateColumn, updateTask as updateTaskAction, setBoard, updateColumnsOrder } from './store/boardSlice';


export const ItemTypes = {
  TASK: 'task',
  COLUMN: 'column'
};

function App() {

  const dispatch = useAppDispatch();

  const currentBoard = useAppSelector(state => state.board.currentBoard);
  const currentUser = useAppSelector(state => state.board.currentUser);
  
  // Инициализация демо-данных, если досок нет
  // useEffect(() => {
  //   if (boards.length === 0) {
  //     const demoBoard: Board = {
  //       id: '1',
  //       name: 'Проект "Канбан"',
  //       owner: 'username',
  //       users: ['username'],
  //       columns: [
  //         {
  //           id: '1',
  //           title: 'В планах',
  //           order: 0,
  //           tasks: [
  //             {
  //               id: '1',
  //               title: 'Задача 1',
  //               description: 'Большой текст задачи 1...',
  //               priority: 'high',
  //               startDate: '2026-02-10',
  //               endDate: '2026-02-20',
  //               tag: 'Приоритетная задача',
  //               order: 0
  //             },
  //             {
  //               id: '2',
  //               title: 'Задача 2',
  //               description: 'Текст задачи 2',
  //               startDate: '2026-02-10',
  //               tag: 'Без срока',
  //               order: 1
  //             }
  //           ]
  //         },
  //         {
  //           id: '2',
  //           title: 'В работе',
  //           order: 1,
  //           tasks: [
  //             {
  //               id: '5',
  //               title: 'Задача 1',
  //               description: 'Текст задачи...',
  //               startDate: '2026-02-10',
  //               order: 0
  //             }
  //           ]
  //         },
  //         {
  //           id: '3',
  //           title: 'Выполнено',
  //           order: 2,
  //           tasks: []
  //         }
  //       ]
  //     };
  //     dispatch(addBoard(demoBoard));
  //   }
  // }, [boards.length, dispatch]);

  const moveTask = useCallback((taskId: number, sourceColumnId: number, targetColumnId: number) =>
    {
      if (!currentBoard) 
        return;

      //сообщение в лог для отладки
      console.log("moving task:", {taskId, sourceColumnId, targetColumnId});

      const sourceColumn = currentBoard.columns.find((col: { id: number; }) => col.id === sourceColumnId);
      const task = sourceColumn?.tasks.find((tsk: { id: number; }) => tsk.id === taskId);

      if (!task)
        return;

      // Сохраняем копию задачи для добавления
      const taskToMove = { ...task };

      // Обновляем порядок задачи для целевой колонки
      const targetColumn = currentBoard.columns.find((col: { id: number; }) => col.id === targetColumnId);
      taskToMove.order = targetColumn ? targetColumn.tasks.length : 0;

      // Используем существующие редьюсеры

      dispatch(removeTask({
        columnId: sourceColumnId,
        taskId: task.id
      }))

      dispatch(addTask({  
        columnId: targetColumnId, 
        task: taskToMove 
      }));

      console.log('борда текущая', currentBoard)
      }, [currentBoard, dispatch])


// Функция перемещения колонок
const moveColumn = useCallback((dragIndex: number, hoverIndex: number) => {
  if (!currentBoard) return;

  console.log('Moving column from', dragIndex, 'to', hoverIndex);

    const sortedColumns = [...currentBoard.columns].sort((a, b) => 
    (a.order || 0) - (b.order || 0)
  );

  //новый массив, старая в отдельный слот
  const newColumns = [...currentBoard.columns];
  const [removedColumn] = newColumns.splice(dragIndex, 1);
  
  // Вставляем на новое место
  newColumns.splice(hoverIndex, 0, removedColumn);

  // Обновляем order и диспатчим
  const updatedColumns = newColumns.map((col, idx) => ({ ...col, order: idx }));
  
  dispatch(updateColumnsOrder({ 
    ...updatedColumns 
  }));  

}, [currentBoard, dispatch]);


  const updateTask = useCallback((columnId: number, updatedTask: Task) => {
    if (!currentBoard) return;
  

    dispatch(updateTaskAction({ 
    taskId: updatedTask.id, 
    updates: updatedTask 
   }));
  }, [currentBoard, dispatch]);

  const updateBoard = useCallback((updatedBoard: Board)=> {
    if (!currentBoard)
      return;

    dispatch(setBoard({...updatedBoard}))
  }, [currentBoard, dispatch])

  const handleBoardTitleChange = (newBoardName: string) =>{
      if (!currentBoard)
        return;

      dispatch(updateBoardName(newBoardName));
    }

  if (!currentBoard) {
    return <div>Кажется, доска до сих пор не выбрана...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <header>
          <h1 className="header-logo">Kan-do-it</h1>
          <nav>
            <a>{currentUser?.userName ?? "Кто ты, воин?"}</a>
            <button name="log-out-btn">Выйти</button>
          </nav>
        </header>

        <div className="main-div">
          <Sidebar />
          
          <div className="work-space">
            <h2 
              className="table-title-h2"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e)=> handleBoardTitleChange(e.currentTarget.textContent || currentBoard.name)}
            >{currentBoard.name}</h2>

            <div className="columns">
              {currentBoard.columns
                  .slice()
                  .sort((a: ColumnType, b: ColumnType) => (a.order || 0) - (b.order || 0))
                  .map((column: ColumnType, index: number) => (
                    <DraggableColumn
                      key={column.id}
                    column={column}
                    index={index}
                    boardId={currentBoard.id}
                    onMoveTask={moveTask}
                    onMoveColumn={moveColumn}
                    onUpdateTask={updateTask}
                    />
                  ))}
            </div>
          </div>
        </div>

        <footer>
          <div>
            Design, develop, test by @DmitryFromFIb. 2026
          </div>
        </footer>
      </div>
    </DndProvider>
  );
}

export default App;