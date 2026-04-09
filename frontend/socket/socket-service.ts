//import { disconnect } from "node:cluster"; пока не очень надо
import { ClientToServerEvents, ServerToClientEvents as ServerToClientEvents } from "../../shared/socket-events.types";
import { io, Socket } from "socket.io-client";
import { Board, Column, Task, User } from "../../shared/types";
import { useCallback } from "react";

class SocketService {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
    private url: string;

    constructor(url: string = 'http://localhost:3000'){
        this.url = url;
    }

    connect(userId: number){
        if (this.socket?.connected)
            return;

        this.socket = io(this.url, {
            auth: {userId},
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', ()=> {
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.warn('Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (err) => {
            console.error('connection error:', err.message);
        });
    }

    disconnect(){
        if (this.socket){
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket(){
        return this.socket;
    }

    //Helper методы для отправки событий
    //board
    joinBoard(boardId: number){
        this.socket?.emit('board:join', boardId);
    }

    updateBoard(boardId: number, board: Partial<Board>){
        this.socket?.emit('board:update', {boardId, board});
    }

    deleteBoard(boardId: number){
        this.socket?.emit('board:delete', boardId)
    }

    //column
    createColumn(boardId: number, column: Column){
        this.socket?.emit('column:create',{boardId, column});
    }

    updateColumn(columnId: number, data: Partial<Column>, boardId: number){
        this.socket?.emit('column:update', {columnId: columnId, data: data, boardId})
    }

    deleteColumn(columnId: number, boardId: number){
        this.socket?.emit('column:delete', {columnId, boardId});
    }

    //task
    createTask(columnId: number, task: Task, boardId: number) {
        this.socket?.emit('task:create', {task, columnId, boardId});
    }

    updateTask(taskId: number, columnId: number, boardId:number, task: Partial<Task>){
        this.socket?.emit('task:update', {taskId, columnId, boardId, task})
    }

    deleteTask(taskId: number, columnId: number, boardId: number){
        this.socket?.emit('task:delete', {taskId, columnId, boardId});
    }


    //Helper методы для подписки
    //board
    onBoardState(callback: (board: Board)=> void){
        this.socket?.on('board:state', callback);
    }

    onBoardUpdated(callback: (data:{boardId: Number, board: Partial<Board>}) => void) {
        this.socket?.on('board:updated', callback);
    }

    onBoardDeleted(callback: (boardId:number) => void){
        this.socket?.on('board:delete:success', callback);
    }

    //column
    onColumnCreated(callback: (column: Column) => void){
        this.socket?.on('column:created', callback);        
    }
    
    onColumnUpdated(callback:(column: Column) => void){
        this.socket?.on('column:updated', callback);
    }

    onColumnDeleted(callback:(columnId: number) => void){
        this.socket?.on('column:deleted', callback);
    }

    //task
    onTaskCreated(callback: (data:{columnId: number, task: Task}) => void){
        this.socket?.on('task:created', callback);
    }

    onTaskUpdated(callback: (data: {columnId: number, task: Task}) => void){
        this.socket?.on('task:updated', callback);
    }

    onTaskDeleted(callback: (data:{taskId: number, columnId: number, boardId: number})=> void){
        this.socket?.on('task:deleted', callback);
    }

    //Helper методы успешных операций
    onBoardUpdateSuccess(callback: (board: Board) => void){
        this.socket?.on('board:update:success', callback);
    }

    onBoardDeleteSuccess(callback: (boardId: number) => void){
        this.socket?.on('board:delete:success', callback);
    }

    //column
    onColumnCreateSuccess(callback: (column: Column) => void){
        this.socket?.on('column:create:success', callback);
    }
    onColumnUpdateSuccess(callback: (column: Column) => void){
        this.socket?.on('column:update:success', callback);
    }
    onColumnDeleteSuccess(callback: (columnId: number)=> void){
        this.socket?.on('column:delete:success', callback);
    }

    //task
    onTaskCreateSuccess(callback: (task: Task) => void){
        this.socket?.on('task:create:success', callback);
    }
    oTaskUpdateSuccess(callback: (task: Task) => void){
        this.socket?.on('task:update:success', callback);
    }
    onTaskDeleteSuccess(callback: (taskId: number) => void){
        this.socket?.on('task:delete:success', callback);
    }

      // Отписка от событий (важно для очистки!)
  off(event: keyof ServerToClientEvents) {
    this.socket?.off(event);
  }
}

export const socketService = new SocketService();
