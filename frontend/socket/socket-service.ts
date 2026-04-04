import { disconnect } from "node:cluster";
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
        this.socket?.emit('board:update', boardId, board);
    }

    deleteBoard(boardId: number){
        this.socket?.emit('board:delete', boardId)
    }

    createColumn(boardId: number){
        this.socket?.emit('column:create', boardId);
    }

    updateColumn(columnId: number, data: Partial<Column>){
        this.socket?.emit('column:update', {columnId: columnId, data: data})
    }

    deleteColumn(columnId: number){
        this.socket?.emit('column:delete', columnId);
    }

    createTask(columnId: number) {
        this.socket?.emit('task:create', columnId);
    }

    updateTask(taskId: number, columnId: number, task: Partial<Task>){
        this.socket?.emit('task:update', {taskId: taskId, columnId: columnId, task: task})
    }

    deleteTask(taskId: number, columnId: number){
        this.socket?.emit('task:delete', taskId, columnId)
    }


    //Helper методы для подписки
    //Всё в чатике висит, вспомнить, доделать

}
