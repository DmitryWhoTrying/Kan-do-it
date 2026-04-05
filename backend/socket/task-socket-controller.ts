import { Socket, Server } from "socket.io";
import {TaskService} from '../service/task-service';
import { ClientToServerEvents, ServerToClientEvets } from "../../shared/socket-events.types";
import { Task } from "../../shared/types";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvets>;

export class TaskSocketController {
    constructor(
        private taskService: TaskService,
        private io: Server<ClientToServerEvents, ServerToClientEvets>
    ) {}

    handleCreate = async (socket: TypedSocket, data: {task:Task, columnId: number, boardId: number}) => {
        try {
            const createdTask = await this.taskService.create(data.task, data.columnId);

            if (!createdTask)
                return socket.emit('error', 'Cannot create task in column id' + data.columnId);

            socket.to(`board:${data.boardId}`).emit('task:created', {columnId:data.columnId, task: createdTask});
            socket.emit('task:create:success', data.task);
        }
        catch (error){
            socket.emit('error', 'Cannot create task');
        }
    }

    handleUpdate = async (socket: TypedSocket, data: {taskId: number, columnId: number, boardId:number, task: Partial<Task>}) => {
        try{
            const updatedTask = await this.taskService.update(data.taskId, data.task, data.columnId);

            if (!updatedTask)
                return socket.emit('error', 'Cannot update task ' + data.taskId);

            socket.to(`board:${data.boardId}`).emit('task:updated', {columnId: data.columnId, task:updatedTask});
            socket.emit('task:update:success', updatedTask);
        }
        catch (error){
            socket.emit('error', 'Cannot update task');
        }
    }

    handleDelete = async (socket: TypedSocket, data: {taskId: number, columnId: number, boardId: number}) =>{
        try{
            const deletedTask = await this.taskService.delete(data.taskId);
            if (!deletedTask)
                return socket.emit('error', 'Cannot delete task ' + data.taskId);

            socket.to(`board:${data.boardId}`).emit('task:deleted', data);
            socket.emit('task:delete:success', data.taskId);
        }
        catch (error){
            socket.emit('error', 'Cannot delete task');
        }
    }
}