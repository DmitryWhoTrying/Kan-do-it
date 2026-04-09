import { Board } from "../shared/types";
import { Task, Column, Permission } from "./types";

export interface ClientToServerEvents{
    //события доски

    //попытка создать доску
    //'board:create': () => void; не нужна т.к. ну кто там в активном сеансе будет)))0

    //удаление доски
    'board:delete': (boardId: number) => void;
    //вход и выход пользователя
    'board:join': (boardId: number) => void;
    'board:leave': (boardId: number)=>void;
    'board:update': (data:{boardId: number, board: Partial<Board>}) => void;

    //события пользователя
    //пока хз надо ли
    //'user:role:changed': (userId: number, permision: Permission) => void;

    //события колонки
    'column:create': (data:{boardId: number, column: Column}) => void;
    'column:update': (data: {columnId: number, data: Partial<Column>, boardId: number}) => void;
    'column:delete': (data:{columnId: number, boardId: number}) => void;

    //события задачи
    'task:create': (data: {task:Task, columnId: number, boardId: number}) => void;
    'task:update': (data: {taskId: number, columnId: number, boardId:number, task: Partial<Task>}) => void;
    'task:delete': (data:{taskId: number, columnId: number, boardId: number}) => void;
}

export interface ServerToClientEvents{
    //изменения доски
    'board:state': (board: Board) => void;
    'board:updated': (data:{boardId: Number, board: Partial<Board>}) => void;
    'board:deleted': (boardId: number) => void;

    //изменения колонки
    'column:created': (column: Column) => void;
    'column:updated': (column: Column) => void;
    'column:deleted': (columnId: number) => void;

    //изменения задачи
    'task:created': (data:{columnId: number, task: Task}) => void;
    'task:updated': (data: {columnId: number, task: Task}) => void;
    'task:deleted': (data: {taskId: number, columnId: number, boardId: number}) => void;

    //ответы об успехе операции
    'board:update:success': (board: Board) => void;
    'board:delete:success': ( boardId: number) => void;

    'column:create:success': (column: Column) => void;
    'column:update:success': (column: Column) => void;
    'column:delete:success': (columnId: number) => void;

    'task:create:success': (task: Task) => void;
    'task:update:success': (task: Task) => void;
    'task:delete:success': ( taskId: number ) => void;

    //ответ об ошибке выполнения операции
    'error': (message: string) => void;
}