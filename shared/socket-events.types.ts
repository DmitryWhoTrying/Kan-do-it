import { Board } from "../backend/generated/prisma/client";
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
    'board:update': (boardId: number, board: Partial<Board>) => void;

    //события пользователя
    //пока хз надо ли
    //'user:role:changed': (userId: number, permision: Permission) => void;

    //события колонки
    'column:create': (boardId: number) => void;
    'column:update': (data: {columnId: number, data: Partial<Column>}) => void;
    'column:delete': (columnId: number) => void;

    //события задачи
    'task:create': (columnId: number) => void;
    'task:update': (data: {taskId: number, columnId: number, task: Partial<Task>}) => void;
    'task:delete': (taskId: number, columnId: number) => void;
}

export interface ServerToClientEvets{
    //изменения доски
    'board:updated': (data:{boardId: Number, board: Partial<Board>}) => void;
    'board:deleted': (boardId: number) => void;

    //изменения колонки
    'column:created': (data:{boardId: number, column: Column}) => void;
    'column:updated': (data: {columnId: number, data: Partial<Column>}) => void;
    'column:deleted': (columnId: number) => void;

    //изменения задачи
    'task:created': (data:{columnId: number, task: Task}) => void;
    'task:updated': (data: {taskId: number, columnId: number, task: Partial<Task>}) => void;
    'task:deleted': (taskId: number, columnId: number) => void;

    'error': (message: string) => void;
}