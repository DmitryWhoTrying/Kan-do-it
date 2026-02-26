import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import '../types';
import { Board, Column, Task } from '../types';

interface boardsState{
    boards: Board[];
}

const initialState:  boardsState= {
    boards: []
}

const boardsSlice = createSlice({
    name: 'boards',
    initialState,
    reducers:{
        //Экшен новой доски
        addBoard: (state, action : PayloadAction<Board>) =>
        {
            state.boards.push(action.payload);
        },

        setBoard:(state, action : PayloadAction<{board : Board}>) =>{
            const curBoard = state.boards.find(brd => brd.id === action.payload.board.id);

            if (curBoard)
            {
                curBoard.name = action.payload.board.name;
                curBoard.owner= action.payload.board.owner;
                curBoard.users = action.payload.board.users;
            }
        },
        
        removeBoard:(state, action : PayloadAction<{boardId : string}>) =>{
            state.boards.filter(brd => brd.id !== action.payload.boardId);
        },

        //Экшен новой колонки
        addColumn: (state, action: PayloadAction<{boardId : string; column : Column}>) =>
        {
            state.boards.find( 
                board => board.id === action.payload.boardId)?.
                columns.push(action.payload.column);     
        },

        setColumn: (state, action: PayloadAction<{boardId : string; column : Column}>) =>
        {
            const editColumn = state.boards.find( 
                board => board.id === action.payload.boardId)?.
                columns.find(col => col.id === action.payload.column.id);   
            if (editColumn)
            {
                editColumn.order = action.payload.column.order;
                editColumn.tasks = action.payload.column.tasks;
                editColumn.title = action.payload.column.title;          
            }
        },

        removeColumn: (state, action: PayloadAction<{boardId : string; columnId : string}>) =>
        {
            state.boards.find(brd=> brd.id === action.payload.boardId)?.
                    columns.filter(col => col.id !== action.payload.columnId);
        }, 

        //Экшен новой задачи
        addTask: (state, action: PayloadAction<{boardId : string; columnId : string, task : Task}>) =>
        {
            state.boards.find( 
                board => board.id === action.payload.boardId)?.
                columns.find(col => col.id === action.payload.columnId)?.
                tasks.push(action.payload.task);  
        },

        setTask: (state, action: PayloadAction<{boardId : string; columnId : string, task : Task}>) =>
        {
            const editTask = state.boards.find( 
                board => board.id === action.payload.boardId)?.
                columns.find(col => col.id === action.payload.columnId)?.
                tasks.find(tsk => tsk.id === action.payload.task.id);
                
            if (editTask)
            {
                editTask.description = action.payload.task.description;
                editTask.endDate = action.payload.task.endDate;
                editTask.priority = action.payload.task.priority;
                editTask.startDate = action.payload.task.startDate;
                editTask.tag = action.payload.task.tag;
                editTask.title = action.payload.task.title;
            }
        },

        removeTask: (state, action: PayloadAction<{boardId : string; columnId : string, taskId : string}>) =>
        {
            const editTask = state.boards.find( 
                board => board.id === action.payload.boardId)?.
                columns.find(col => col.id === action.payload.columnId)?.
                tasks.filter(tsk => tsk.id !== action.payload.taskId);   
        }
    }
});


export const {
    addTask, setTask, removeTask, 
    addColumn, setColumn, removeColumn,
    addBoard, setBoard, removeBoard 
} = boardsSlice.actions;

export default boardsSlice.reducer;