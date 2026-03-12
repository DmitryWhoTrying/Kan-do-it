import {Task} from "../../shared/types"

export interface ITaskRepository{
    create(task: Omit<Task, 'id' | 'createdAt'>, columnId: number): Promise<Task>;
    update(taskID: number, data: Partial<Task>, columnId: number): Promise<Task | null>;
    delete(taskID: number): Promise<boolean>;
    findAll(): Promise<Task[]>;
    
    find(taskID: number): Promise<Task | null>;
}