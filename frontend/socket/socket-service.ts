//import { disconnect } from "node:cluster"; пока не очень надо
import { ClientToServerEvents, ServerToClientEvets } from "../../shared/socket-events.types";
import { io, Socket } from "socket.io-client";
import { Board, Column, Task } from "../../shared/types";

class SocketService {
    private socket: Socket<ServerToClientEvets, ClientToServerEvents> | null = null;
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
    joinBoard(boardId: number){
        this.socket?.emit('board:join', boardId);
    }

    updateBoard(boardId: number, board: Partial<Board>){
        this.socket?.emit('board:update', {boardId, board});
    }

    deleteBoard(boardId: number){
        this.socket?.emit('board:delete', boardId)
    }

    createColumn(boardId: number, column: Column){
        this.socket?.emit('column:create',{boardId, column});
    }

    updateColumn(columnId: number, data: Partial<Column>, boardId: number){
        this.socket?.emit('column:update', {columnId: columnId, data: data, boardId})
    }

    deleteColumn(columnId: number, boardId: number){
        this.socket?.emit('column:delete', {columnId, boardId});
    }

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
    //Всё в чатике висит, вспомнить, доделать


}
