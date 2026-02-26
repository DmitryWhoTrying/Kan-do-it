import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Column from './components/Column';
import { Task, Column as ColumnType } from './types';


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

  const handleDragStart = (e: React.DragEvent, taskId: string, sourceColumnId: string) => {
    // It's good practice to set effectAllowed
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
      taskId,
      sourceColumnId
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Optional: e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { taskId, sourceColumnId } = data;

      if (sourceColumnId === targetColumnId) return;

      setColumns(prevColumns => {
        // 1. Find the task to move
        const sourceColumn = prevColumns.find(col => col.id === sourceColumnId);
        const taskToMove = sourceColumn?.tasks.find(task => task.id === taskId);

        if (!taskToMove) return prevColumns;

        // 2. Return a completely new structure with new references
        return prevColumns.map(col => {
          if (col.id === sourceColumnId) {
            // Remove task from source (create new tasks array)
            return {
              ...col,
              tasks: col.tasks.filter(task => task.id !== taskId)
            };
          }
          if (col.id === targetColumnId) {
            // Add task to target (create new tasks array)
            const newTasks = 
                  taskToMove.priority === 'high' ? 
                  [taskToMove, ...col.tasks] : [...col.tasks, taskToMove] 
            return {
              ...col,
              tasks: newTasks
            };
          }
          return col;
        });
      });
    } catch (error) {
      console.error('Drop error:', error);
    }
  };

  return (
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
            {columns.map(column => (
              <Column
                key={column.id}
                column={column}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
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
  );
}


export default App;