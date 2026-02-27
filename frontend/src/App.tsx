import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import DraggableColumn from './components/DraggableColumn';
import { Task as TaskType, Column as ColumnType, Board, Task } from '../../shared/types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { addBoard, addTask, setBoardName, removeColumn, setColumnOrder, removeTask, setColumn, setTask, setBoard } from './store/boardSlice';


export const ItemTypes = {
  TASK: 'task',
  COLUMN: 'column'
};

function App() {

  const dispatch = useAppDispatch();

  const boards = useAppSelector(state => state.boards.boards);
  const currentBoard = boards[0];
  
  // Инициализация демо-данных, если досок нет
  useEffect(() => {
    if (boards.length === 0) {
      const demoBoard: Board = {
        id: '1',
        name: 'Проект "Канбан"',
        owner: 'username',
        users: ['username'],
        columns: [
          {
            id: '1',
            title: 'В планах',
            order: 0,
            tasks: [
              {
                id: '1',
                title: 'Задача 1',
                description: 'Большой текст задачи 1...',
                priority: 'high',
                startDate: '2026-02-10',
                endDate: '2026-02-20',
                tag: 'Приоритетная задача',
                order: 0
              },
              {
                id: '2',
                title: 'Задача 2',
                description: 'Текст задачи 2',
                startDate: '2026-02-10',
                tag: 'Без срока',
                order: 1
              }
            ]
          },
          {
            id: '2',
            title: 'В работе',
            order: 1,
            tasks: [
              {
                id: '5',
                title: 'Задача 1',
                description: 'Текст задачи...',
                startDate: '2026-02-10',
                order: 0
              }
            ]
          },
          {
            id: '3',
            title: 'Выполнено',
            order: 2,
            tasks: []
          }
        ]
      };
      dispatch(addBoard(demoBoard));
    }
  }, [boards.length, dispatch]);

  const moveTask = useCallback((taskId: string, sourceColumnId: string, targetColumnId: string) =>
    {
      if (!currentBoard) 
        return;

      //сообщение в лог для отладки
      console.log("moving task:", {taskId, sourceColumnId, targetColumnId});

      const sourceColumn = currentBoard.columns.find((col: { id: string; }) => col.id === sourceColumnId);
      const task = sourceColumn?.tasks.find((tsk: { id: string; }) => tsk.id === taskId);

      if (!task)
        return;

      // Сохраняем копию задачи для добавления
      const taskToMove = { ...task };

      // Обновляем порядок задачи для целевой колонки
      const targetColumn = currentBoard.columns.find((col: { id: string; }) => col.id === targetColumnId);
      taskToMove.order = targetColumn ? targetColumn.tasks.length : 0;

      // Используем существующие редьюсеры
      dispatch(removeTask({ 
        boardId: currentBoard.id, 
        columnId: sourceColumnId, 
        taskId: task.id 
      }));

      dispatch(addTask({ 
        boardId: currentBoard.id, 
        columnId: targetColumnId, 
        task: taskToMove 
      }));

      console.log("борды из стора", boards)
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
  
  dispatch(setColumnOrder({ 
    boardId: currentBoard.id, 
    columnsToSet: updatedColumns 
  }));  

}, [currentBoard, dispatch]);


  const updateTask = useCallback((columnId: string, updatedTask: Task) => {
    if (!currentBoard) 
      return;
    
    dispatch(setTask({
      boardId: currentBoard.id,
      columnId: columnId,
      task: updatedTask
    }));
  }, [currentBoard, dispatch]);

  const updateBoard = useCallback((updatedBoard: Board)=> {
    if (!currentBoard)
      return;

    dispatch(setBoard({board: updatedBoard}))
  }, [currentBoard, dispatch])

  const handleBoardTitleChange = (newBoardName: string) =>{
      if (!currentBoard)
        return;

      dispatch(setBoardName(
        {boardId: currentBoard.id,
         boardName: newBoardName
        }))
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
            <a>{currentBoard.owner}</a>
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