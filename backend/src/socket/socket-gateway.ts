// backend/src/socket/socket-gateway.ts
import { Socket, Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket-events.types";

// Импорт упрощенных контроллеров (только для управления подключением)
import { BoardSocketController } from "./board-socket-controller";

// Импорт нового эмиттера
import { SocketEmitter } from "./socket-emitter";

import { prisma } from '../lib/prisma';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedIO = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerSocketHandlers(io: TypedIO) {
    
    // Создаем SocketEmitter (синглтон для всего приложения)
    const socketEmitter = new SocketEmitter(io);

    // В новой архитектуре они больше НЕ нуждаются в сервисах (нет бизнес-логики).
    // Им нужен только io (или socketEmitter), если нужно уведомлять о системных событиях.
    const boardSocketController = new BoardSocketController(socketEmitter);

    // Регистрируем обработчики подключений
    io.on('connection', (socket: TypedSocket) => {
        console.log(`Socket connected: ${socket.id}, User: ${socket.handshake.auth.userId}`);

        // === BOARD EVENTS (Только управление комнатами) ===
        
        // Пользователь хочет видеть доску -> добавляем его в комнату
        socket.on('board:join', (boardId: number) => {
            boardSocketController.handleJoin(socket, boardId);
        });

        // Пользователь ушел с доски -> удаляем из комнаты
        socket.on('board:leave', (boardId: number) => {
            boardSocketController.handleLeave(socket, boardId);
        });

        // УДАЛЕНО: socket.on('board:update', ...)
        // УДАЛЕНО: socket.on('board:delete', ...)
        // Обновления теперь идут только через HTTP POST/PUT/DELETE

        // === COLUMN & TASK EVENTS ===
        
        // УДАЛЕНО: Все обработчики create, update, delete для колонок и задач
        // Фронтенд больше не отправляет эти события через сокет.

        // === SYSTEM EVENTS ===
        
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            // Опционально: уведомить других, что пользователь оффлайн
            // socketEmitter.emitUserLeft(socket.handshake.auth.userId);
        });
    });

    // Возвращаем эмиттер, чтобы использовать его в HTTP-контроллерах
    // (Если вы вызываете эту функцию из app.ts, вы можете получить доступ к эмиттеру)
    return socketEmitter;
}