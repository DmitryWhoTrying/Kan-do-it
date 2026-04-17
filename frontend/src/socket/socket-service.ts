//import { disconnect } from "node:cluster"; пока не очень надо
import { ClientToServerEvents, ServerToClientEvents as ServerToClientEvents } from "../../../shared/socket-events.types";
import { io, Socket } from "socket.io-client";
import { Board, Column, Task, User } from "../../../shared/types";
import { useCallback } from "react";

class SocketService {
    public socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
    private url: string;

    constructor(url: string = 'http://localhost:3000'){
        this.url = url;
        console.log(`[SocketService] 🆔 Instance created: ${this.constructor.name}#${(this as any)._id || Math.random().toString(36).slice(2, 8)}`);
        (this as any)._id = (this as any)._id || Math.random().toString(36).slice(2, 8);
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
            //alert('Потеряно соединение c сокетом! Bo избежание рассинхронизации перезагрузите страницу');
        });

        this.socket.on('connect_error', (err) => {
            console.error('connection error:', err.message);
        });

        this.socket.onAny((event, arg) => {
            //console.log(`📥 [SOCKET IN] ${event}`, arg);
            console.log(`📥 [RAW] Event: "${event}", Args:`, arg);
    console.log('  Expected: "board:updated", "column:created", etc.');
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
        if (!this.socket?.connected) {
                console.warn('⚠️ Cannot join room: socket not connected');
                return;
        }

        console.log(`🔑 Joining room: board:${boardId}`);
        this.socket?.emit('board:join', boardId);
    }

    //Helper методы для подписки
    //board
    onBoardState(callback: (board: Board)=> void){
        this.socket?.on('board:state', callback);

        return () => {
            this.socket?.off('board:state', callback);
        };
    }

    onBoardUpdated(callback: (board: Board) => void) {
        this.socket?.on('board:updated', callback);

        return () => {
            this.socket?.off('board:updated', callback);
        };
    }

    onBoardDeleted(callback: (boardId:number) => void){
        this.socket?.on('board:deleted', callback);
        return ()=>{
            this.socket?.off('board:deleted', callback);
        };
    }

    //column
    onColumnCreated(callback: (column: Column) => void): () => void {
        this.socket?.on('column:created', callback);
        return () => {
            this.socket?.off('column:created', callback);
         };
  }
    
    onColumnUpdated(callback:(column: Column) => void){
        this.socket?.on('column:updated', callback);

        return ()=>{
            this.socket?.off('column:updated', callback);
        };
    }

    onColumnDeleted(callback:(columnId: number) => void){
        this.socket?.on('column:deleted', callback);

        return ()=> {
            this.socket?.off('column:deleted', callback)
        };
    }

    //task
    onTaskCreated(callback: (data:{columnId: number, task: Task}) => void){
        this.socket?.on('task:created', callback);
        return () =>{
            this.socket?.off('task:created', callback);
        };
    }

    onTaskUpdated(callback: (data: {columnId: number, task: Task}) => void){
        this.socket?.on('task:updated', callback);

        return () => {
            this.socket?.off('task:updated', callback);
        };
    }

    onTaskDeleted(callback: (data:{taskId: number, columnId: number, boardId: number})=> void){
        this.socket?.on('task:deleted', callback);

        return () => {
            this.socket?.off('task:deleted', callback);
        };
    }

      // Отписка от событий
  off(event: any, callback?: (...args: any[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback); // ✅ Отписываем конкретный колбэк
    } else {
      this.socket?.off(event); // ⚠️ Отписываем ВСЕ колбэки для события
    }
  }
}

export const socketService = new SocketService();
