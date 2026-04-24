import {Server} from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/socket-events.types';
import {Board, Column, Task} from '../../../shared/types';

type TypedIO = Server<ClientToServerEvents, ServerToClientEvents>;

export class SocketEmitter {
    constructor(private io: TypedIO) {}

    // === BOARD EVENTS ===
    
    emitBoardUpdated(boardId: number, board: Board) {
        console.log("emitted message: board updated to", boardId);
        this.io.to(`board:${boardId}`).emit('board:updated', board);
        this.io.to(`board:${boardId}`).emit('test:event', 'Hello from server!');
    }

    emitBoardDeleted(boardId: number) {
        this.io.to(`board:${boardId}`).emit('board:deleted', boardId);
    }

    // === COLUMN EVENTS ===

    emitColumnCreated(boardId: number, column: Column) {
        console.log("emitted message: column created to", boardId);
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

    // === USER EVENTS ===
    emitUserKicked(boardId: number, userId: number) {
        this.io.to(`board:${boardId}`).emit('user:kicked', userId);
    }

    emitUserRoleChanged(boardId: number, userId: number, permission: Board['users'][0]['permission']) {
        this.io.to(`board:${boardId}`).emit('user:role:changed', userId, permission);
    }
}