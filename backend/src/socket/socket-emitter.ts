import {Server} from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/socket-events.types';
import {Board, Column, Task} from '../../../shared/types';

type TypedIO = Server<ClientToServerEvents, ServerToClientEvents>;

export class SocketEmitter {
    constructor(private io: TypedIO) {}

    // === BOARD EVENTS ===
    
    emitBoardUpdated(boardId: number, board: Board) {
        this.io.to(`board:${boardId}`).emit('board:updated', board);
    }

    emitBoardDeleted(boardId: number) {
        this.io.to(`board:${boardId}`).emit('board:deleted', boardId);
    }

    // === COLUMN EVENTS ===

    emitColumnCreated(boardId: number, column: Column) {
        this.io.to(`board:${boardId}`).emit('column:created', column);
    }

    emitColumnUpdated(boardId: number, column: Column) {
        this.io.to(`board:${boardId}`).emit('column:updated', column);
    }

    emitColumnDeleted(boardId: number, columnId: number) {
        this.io.to(`board:${boardId}`).emit('column:deleted', columnId);
    }

    // === TASK EVENTS ===

    emitTaskCreated(boardId: number, columnId: number, task: Task) {
        this.io.to(`board:${boardId}`).emit('task:created', { columnId, task });
    }

    emitTaskUpdated(boardId: number, columnId: number, task: Task) {
        this.io.to(`board:${boardId}`).emit('task:updated', {task, columnId});
    }

    emitTaskDeleted(boardId: number, taskId: number, columnId: number) {
        this.io.to(`board:${boardId}`).emit('task:deleted', {taskId, columnId, boardId});
    }
}