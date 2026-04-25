import {Socket, Server} from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/socket-events.types';
import { SocketEmitter } from './socket-emitter';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export class BoardSocketController{
    constructor(private socketEmitter: SocketEmitter) {}

    handleJoin = (socket: TypedSocket, boardId: number) => {
        // Базовая проверка авторизации
        const userId = socket.handshake.auth.userId;
        if (!userId) {
            return socket.emit('error', 'Unauthorized');
        }

        //консольное сообщение для отладки
        //console.log('Handling user socket join');
        socket.join(`board:${boardId}`);      
    };

    handleLeave = (socket: TypedSocket, boardId: number) => {
        socket.leave(`board:${boardId}`);
        console.log(`User ${socket.handshake.auth.userId} left board ${boardId}`);
    };

}