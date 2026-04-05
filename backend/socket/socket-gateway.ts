import { Socket, Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvets } from "../../shared/socket-events.types";
import { BoardSocketController} from "./board-socket-controller";
import { ColumnSocketController } from "./column-socket-controller";
import { TaskSocketController } from "./task-socket-controller";
import { Board, Task } from "../../shared/types";
import { ColumnService } from "../service/column-service";
import { BoardService } from "../service/board-service";

import { PrismaBoardRepository } from "../repositories/board-prisma-repository";
import { PrismaColumnRepository} from '../repositories/column-prisma-repository';
import { PrismaTaskRepository } from "../repositories/task-prisma-repository";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

import {prisma} from '../Lib/prisma';

import { TaskService } from "../service/task-service";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvets>;
type TypedIO = Server<ClientToServerEvents, ServerToClientEvets>;

export function registerSocketHandlers(io: TypedIO){

    // 2. Создаем репозитории
    const boardRepository = new PrismaBoardRepository(prisma);
    const columnRepository = new PrismaColumnRepository(prisma);
    const taskRepository = new PrismaTaskRepository(prisma);

    // 3. Создаем сервисы
    const boardService = new BoardService(boardRepository);
    const columnService = new ColumnService(columnRepository);
    const taskService = new TaskService(taskRepository);

    const boardSocketController = new BoardSocketController(boardService, io);
    const columnSocketController = new ColumnSocketController(columnService, io);
    const taskSocketController = new TaskSocketController(taskService, io);

    io.on('connection', (socket: TypedSocket) => {
        
        // Board events
        socket.on('board:join', (boardId) => boardSocketController.handleJoin(socket, boardId));
        socket.on('board:leave', (boardId) => boardSocketController.handleLeave(socket, boardId));
        socket.on('board:update', (data) => boardSocketController.handleUpdate(socket, data));
        socket.on('board:delete', (data) => boardSocketController.handleDelete(socket, data));

        //column events
        socket.on('column:create', (data) => columnSocketController.handleCreate(socket, data));
        socket.on('column:update', (data) => columnSocketController.handleUpdate(socket, data));
        socket.on('column:delete', (data) => columnSocketController.handleDelete(socket, data));

        // Task events
        socket.on('task:create', (data) => taskSocketController.handleCreate(socket, data));
        socket.on('task:update', (data) => taskSocketController.handleUpdate(socket, data));
        socket.on('task:delete', (data) => taskSocketController.handleDelete(socket, data));

        socket.on('disconnect', () => {
            console.log(`Socket ${socket.id} disconnected`);
        });
    });
}