import { disconnect } from "node:cluster";
import { ClientToServerEvents, ServerToClientEvets } from "../../shared/socket-events.types";
import { io, Socket } from "socket.io-client";

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

    //Helper методы

}
