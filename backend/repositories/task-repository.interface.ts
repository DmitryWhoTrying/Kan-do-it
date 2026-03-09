import {Task} from "../../shared/types"

export interface ITaskRepository{
    create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task>;
    update(taskID: number, data: Partial<Task>): Promise<Task | null>;
    delete(taskID: number): Promise<boolean>;
    findAll(): Promise<Task[]>;
    
    find(taskID: number): Promise<Task | null>;
}