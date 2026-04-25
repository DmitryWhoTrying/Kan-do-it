import { TaskImage } from "../../../shared/types";

export interface ITaskImageRepository{
    create(taskImage: Omit<TaskImage, 'id' | 'createdAt' | 'updatedAt'>) : Promise<TaskImage|null>;  
    delete(imageId: number) : Promise<boolean>;
    find(imageId: number) : Promise<TaskImage | null>;
    findAll():Promise<TaskImage[]>;
    findByTaskId(taskId: number):Promise<TaskImage[]>;
    countByTaskId(taskId: number): Promise<number>;
}