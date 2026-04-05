import { Socket, Server } from "socket.io";
import {ColumnService} from '../service/column-service';
import { ClientToServerEvents, ServerToClientEvets } from "../../../shared/socket-events.types";
import { Column } from "../../../shared/types";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvets>;

export class ColumnSocketController {
    constructor(
        private columnService: ColumnService,
        private io: Server<ClientToServerEvents, ServerToClientEvets>
    ) {}

    handleCreate = async (socket: TypedSocket, data:{boardId: number, column: Column}) => {
        try {
            const createdColumn = await this.columnService.create(data.column, data.boardId);

            if (!createdColumn)
                return socket.emit('error', 'Column not created, board id not found');

            socket.to(`board:${data.boardId}`).emit('column:created', createdColumn);
            socket.emit('column:create:success', data.column);
        }
        catch (error){
            socket.emit('error', 'Cannot create column');
        }
    }

    handleUpdate = async (socket: TypedSocket, data:{columnId: number, data: Partial<Column>, boardId: number}) => {
        try {
            const updatedColumn = await this.columnService.update(data.columnId, data.data);

            if (!updatedColumn)
                return socket.emit('error', 'Cannot update column with id ' + data.columnId);

            socket.to(`board:${data.boardId}`).emit('column:updated', updatedColumn);
            socket.emit('column:update:success', updatedColumn);
        }
        catch (error){
            socket.emit('error', 'Cannot update column');
        }
    }

    handleDelete = async (socket: TypedSocket, data:{columnId: number, boardId: number}) => {
        try {
            const deletedColumn = await this.columnService.delete(data.columnId);

            if (!deletedColumn)
                return socket.emit('error', 'Cannot delete column with id ' + data.columnId);

            socket.to(`board:${data.boardId}`).emit('column:deleted', data.columnId);
            socket.emit('column:delete:success', data.columnId);
        }
        catch (error){
            socket.emit('error', 'Cannot delete column');
        }
    }
}