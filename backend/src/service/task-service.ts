import { ITaskRepository } from "../repositories/task-repository.interface";
import { Task } from "../../../shared/types";


export class TaskService{
    constructor(
        private TaskRepository: ITaskRepository,
    ){};

    async create(data: Omit<Task, 'id' | 'createdAt'>, columnId: number){
        const task = await this.TaskRepository.create(data, columnId);
        return task;
    }

    async update(taskId: number, data: Partial<Task>, columnId: number){
        const task = await this.TaskRepository.update(taskId, data, columnId);
        return task;
    }

    async delete(taskId: number){
        const task = await this.TaskRepository.delete(taskId);
        return task;
    }

    async findAll(){
        return await this.TaskRepository.findAll();
    }

    async find(taskId: number){
        const task = await this.TaskRepository.find(taskId);
        return task;
    }

    async findByColumn(columnId: number){
        const tasks = await this.TaskRepository.findByColumn(columnId);
        return tasks;
    }
}