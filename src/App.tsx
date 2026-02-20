import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Тест работает!</h1>
      <p>Если вы видите это - React работает</p>
    </div>
  );
}

export default App;



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