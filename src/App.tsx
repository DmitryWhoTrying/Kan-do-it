import React, { useState } from 'react';
import './App.css';

// Временные типы прямо в файле
interface Task {
  id: string;
  title: string;
  description: string;
  tag?: string;
  startDate?: string;
  endDate?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

// Компонент Task внутри файла
const TaskCard = ({ task }: { task: Task }) => (
  <div className="task" draggable>
    {task.tag && (
      <h3 className={`task-tag ${task.tag === 'Без срока' ? 'no-deadline' : 'high-priority'}`}>
        {task.tag}
      </h3>
    )}
    <div className="task-content">
      <h3 className="task-name">{task.title}</h3>
      <p>{task.description}</p>
      <div className="task-time-div">
        {task.startDate && (
          <time className="task-start-date">от {task.startDate}</time>
        )}
        {task.endDate && (
          <time className="task-end-date">до {task.endDate}</time>
        )}
      </div>
    </div>
  </div>
);

// Компонент Column внутри файла
const ColumnComponent = ({ column }: { column: Column }) => (
  <div className="column">
    <h2 className="column-name">{column.title}</h2>
    {column.tasks.map(task => (
      <TaskCard key={task.id} task={task} />
    ))}
  </div>
);

// Компонент Sidebar внутри файла
const SidebarComponent = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div id="sidebar" className={isExpanded ? 'expanded' : ''}>
      <button className="toggle-btn" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="icon">☰</span>
        <span className="text">Свернуть</span>
      </button>
      <div className="menu-item"><span className="icon">🏠</span><span className="text">Доски</span></div>
      <div className="menu-item"><span className="icon">👁️‍🗨️</span><span className="text">Пользователи</span></div>
      <div className="menu-item"><span className="icon">⚙️</span><span className="text">Настройки</span></div>
    </div>
  );
};

function App() {
  const [columns] = useState<Column[]>([
    {
      id: '1',
      title: 'В планах',
      tasks: [
        { id: '1', title: 'Задача 1', description: 'Описание задачи 1', tag: 'Приоритетная задача', startDate: '10-02-2026' }
      ]
    },
    {
      id: '2',
      title: 'В работе',
      tasks: [
        { id: '2', title: 'Задача 2', description: 'Описание задачи 2', startDate: '10-02-2026' }
      ]
    }
  ]);

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
        <SidebarComponent />
        <div className="work-space">
          <div className="columns">
            {columns.map(column => (
              <ColumnComponent key={column.id} column={column} />
            ))}
          </div>
        </div>
      </div>

      <footer>
        <div>Design, develop, test by @DmitryFromFIb. 2026</div>
      </footer>
    </div>
  );
}

export default App;

// import React from 'react';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <h1>Тест работает!</h1>
//       <p>Если вы видите это - React работает</p>
//     </div>
//   );
// }

// export default App;



// import React, { useState } from 'react';
// import './App.css';
// import Sidebar from './components/Sidebar';
// import Column from './components/Column';
// import { Task, Column as ColumnType } from './types';

// function App() {
//   const [columns, setColumns] = useState<ColumnType[]>([
//     {
//       id: '1',
//       title: 'В планах',
//       tasks: [
//         {
//           id: '1',
//           title: 'Задача 1',
//           description: 'Большой текст задачи 1...',
//           priority: 'high',
//           startDate: '2026-02-10',
//           endDate: '2026-02-20',
//           tag: 'Приоритетная задача'
//         }
//       ]
//     },
//     {
//       id: '2',
//       title: 'В работе',
//       tasks: [
//         {
//           id: '5',
//           title: 'Задача 1',
//           description: 'Текст задачи...',
//           startDate: '2026-02-10'
//         }
//       ]
//     }
//   ]);

//   const handleDragStart = (e: React.DragEvent, taskId: string, sourceColumnId: string) => {
//     e.dataTransfer.setData('text/plain', JSON.stringify({
//       taskId,
//       sourceColumnId
//     }));
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//   };

//   const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
//     e.preventDefault();
    
//     try {
//       const data = JSON.parse(e.dataTransfer.getData('text/plain'));
//       const { taskId, sourceColumnId } = data;

//       if (sourceColumnId === targetColumnId) return;

//       setColumns(prevColumns => {
//         const newColumns = [...prevColumns];
        
//         const sourceColumnIndex = newColumns.findIndex(col => col.id === sourceColumnId);
//         const targetColumnIndex = newColumns.findIndex(col => col.id === targetColumnId);
        
//         if (sourceColumnIndex === -1 || targetColumnIndex === -1) return prevColumns;
        
//         const taskIndex = newColumns[sourceColumnIndex].tasks.findIndex(task => task.id === taskId);
//         if (taskIndex === -1) return prevColumns;
        
//         const [movedTask] = newColumns[sourceColumnIndex].tasks.splice(taskIndex, 1);
//         newColumns[targetColumnIndex].tasks.push(movedTask);
        
//         return newColumns;
//       });
//     } catch (error) {
//       console.error('Drop error:', error);
//     }
//   };

//   return (
//     <div className="App">
//       <header>
//         <h1 className="header-logo">Kan-do-it</h1>
//         <nav>
//           <a>username</a>
//           <button name="log-out-btn">Выйти</button>
//         </nav>
//       </header>

//       <div className="main-div">
//         <Sidebar />
        
//         <div className="work-space">
//           <div className="columns">
//             {columns.map(column => (
//               <Column
//                 key={column.id}
//                 column={column}
//                 onDragStart={handleDragStart}
//                 onDragOver={handleDragOver}
//                 onDrop={handleDrop}
//               />
//             ))}
//           </div>
//         </div>
//       </div>

//       <footer>
//         <div>
//           Design, develop, test by @DmitryFromFIb. 2026
//         </div>
//       </footer>
//     </div>
//   );
// }

// function toggleMenu() {
//             const sidebar = document.getElementById('sidebar');
//             const btnText = document.querySelector('.toggle-btn .text');
            
//             if (sidebar === null || btnText === null)
//                 return;

//             sidebar.classList.toggle('expanded');
            
//             if (sidebar.classList.contains('expanded')) {
//                 btnText.textContent = 'Свернуть';
//             } else {
//                 btnText.textContent = 'Развернуть';
//             }
//         }

// export default App;