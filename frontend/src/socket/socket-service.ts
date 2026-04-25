//import { disconnect } from "node:cluster"; пока не очень надо
import { ClientToServerEvents, ServerToClientEvents as ServerToClientEvents } from "../../../shared/socket-events.types";
import { io, Socket } from "socket.io-client";
import { Board, BoardUser, Column, Task, TaskImage} from "../../../shared/types";

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
        });

        this.socket.on('connect_error', (err) => {
            console.error('connection error:', err.message);
        });


        //лог для отладки
        // this.socket.onAny((event, arg) => {
        //     console.log(`[RAW] Event: "${event}", Args:`, arg);

        // });
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
                console.warn('Cannot join room: socket not connected');
                return;
        }

        console.log(`Joining room: board:${boardId}`);
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

    onUserKicked(callback: (userId: number) => void){
        this.socket?.on('user:kicked', callback);
        return () => {
            this.socket?.off('user:kicked', callback);
        }
    }

    onUserRoleChanged(callback: (userId: number, permission: BoardUser['permission']) => void){
        this.socket?.on('user:role:changed', callback);
        return () => {
            this.socket?.off('user:role:changed', callback);
        }
    }

    //картинки
    onTaskImageAdded(callback: (data:{taskId: number, image: TaskImage}) => void){
        this.socket?.on('task:image:added', callback);
        return () => {
            this.socket?.off('task:image:added', callback);
        }
    }

    onTaskImageUpdated(callback: (data:{taskId: number, imageId: number, image: TaskImage}) => void){
        this.socket?.on('task:image:updated', callback);
        return () => {
            this.socket?.off('task:image:updated', callback);
        }
    }

    onTaskImageDeleted(callback: (data:{taskId: number,  imageId: number}) => void){
        this.socket?.on('task:image:deleted', callback);
        return () => {
            this.socket?.off('task:image:deleted', callback);
        }
    }


      // Отписка от событий
  off(event: any, callback?: (...args: any[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback); //Отписываем конкретный колбэк
    } else {
      this.socket?.off(event); // Отписываем ВСЕ колбэки
    }
  }
}

export const socketService = new SocketService();
