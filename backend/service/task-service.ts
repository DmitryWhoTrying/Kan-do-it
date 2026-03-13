import { Server } from "socket.io";
import { ITaskRepository } from "../repositories/task-repository.interface";
import { Task } from "../../shared/types";


export class TaskService{
    constructor(
        private TaskRepository: ITaskRepository,
        private io: Server
    ){};

    async create(data: Omit<Task, 'id' | 'createdAt'>, columnId: number){
        const task = await this.TaskRepository.create(data, columnId);
        this.io.emit('task:create', task);
        return task;
    }

    async update(taskId: number, data: Partial<Task>, columnId: number){
        const task = await this.TaskRepository.update(taskId, data, columnId);
        if (task)
            this.io.emit('task:update', taskId);
        else
            this.io.emit('task:update error', taskId);
        return task;
    }

    async delete(taskId: number){
        const task = await this.TaskRepository.delete(taskId);
        if (task)
            this.io.emit('task:delete', taskId);
        else
            this.io.emit('task:delete error', taskId);
        return task;
    }

    async findAll(){
        return await this.TaskRepository.findAll();
    }

    async find(taskId: number){
        const task = await this.TaskRepository.find(taskId);
        if (task)
            this.io.emit('task:find', task);
        else
            this.io.emit('task:find error', taskId);

        return task;
    }
}