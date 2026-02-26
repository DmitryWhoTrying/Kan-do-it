import React, { useState, useCallback } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import DraggableColumn from './components/DraggableColumn';
import { Task, Column as ColumnType } from './types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


export const ItemTypes = {
  TASK: 'task',
  COLUMN: 'column'
};

function App() {
  const [columns, setColumns] = useState<ColumnType[]>([
    {
      id: '1',
      title: 'В планах',
      tasks: [
        {
          id: '1',
          title: 'Задача 1',
          description: 'Большой текст задачи 1 не умещающийся в 3 строчках ну никак...',
          priority: 'high',
          startDate: '2026-02-10',
          endDate: '2026-02-20',
          tag: 'Приоритетная задача'
        }
      ]
    },
    {
      id: '2',
      title: 'В работе',
      tasks: [
        {
          id: '5',
          title: 'Задача 1',
          description: 'Текст задачи...',
          startDate: '2026-02-10'
        },
        {
          id: '6',
          title: 'Задача 1',
          description: 'Текст задачи...',
          startDate: '2026-02-10'
        },
        {
          id: '7',
          title: 'Задача 1',
          description: 'Текст задачи...',
          startDate: '2026-02-10'
        }
      ]
    }
  ]);



    // Функция перемещения задачи между колонками
  const moveTask = useCallback((taskId: string, sourceColumnId: string, targetColumnId: string) => {
    console.log('Moving task:', { taskId, sourceColumnId, targetColumnId });
    
    setColumns(prevColumns => {
      // Находим исходную и целевую колонки
      const sourceColumn = prevColumns.find(col => col.id === sourceColumnId);
      const targetColumn = prevColumns.find(col => col.id === targetColumnId);
      
      if (!sourceColumn || !targetColumn) {
        console.log('Column not found');
        return prevColumns;
      }
      
      // Находим задачу в исходной колонке
      const taskIndex = sourceColumn.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        console.log('Task not found');
        return prevColumns;
      }
      
      // Создаем копии массивов задач
      const newSourceTasks = [...sourceColumn.tasks];
      const [movedTask] = newSourceTasks.splice(taskIndex, 1);
      
      // Обновляем состояние
      return prevColumns.map(col => {
        if (col.id === sourceColumnId) {
          return { ...col, tasks: newSourceTasks };
        }
        if (col.id === targetColumnId) {
          return { ...col, tasks: [...col.tasks, movedTask] };
        }
        return col;
      });
    });
  }, []);

  // Функция перемещения колонок
  const moveColumn = useCallback((dragIndex: number, hoverIndex: number) => {
    console.log('Moving column:', { dragIndex, hoverIndex });
    
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const [removed] = newColumns.splice(dragIndex, 1);
      newColumns.splice(hoverIndex, 0, removed);
      
      // Обновляем order для каждой колонки
      return newColumns.map((col, index) => ({
        ...col,
        order: index
      }));
    });
  }, []);

  
return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <header>
          <h1 className="header-logo">Kan-do-it</h1>
          <nav>
            <a>username</a>
            <button name="log-out-btn">Выйти</button>
          </nav>
        </header>

        <div className="main-div">
          <Sidebar />
          
          <div className="work-space">
            <div className="columns">
              {columns
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((column, index) => (
                    <DraggableColumn
                      key={column.id}
                      column={column}
                      index={index}
                      onMoveTask={moveTask}
                      onMoveColumn={moveColumn}
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