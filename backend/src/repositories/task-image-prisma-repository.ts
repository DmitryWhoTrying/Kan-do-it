import { PrismaClient } from "@prisma/client";
import { TaskImage } from "../../../shared/types";
import { ITaskImageRepository } from "./task-image-repository.interface";
import { TaskMapper } from "src/mappers/TaskMapper";
import { error } from "node:console";

export interface ProcessedImage {
    original: string; //путь к оригинальному изображению
    thumbnail: string;//путь превью
    url: string; // public url
    thumbnailUrl: string; // public url для превью
    size: number; // размер оригинального файла в байтах
    width: number; 
    height: number;
}

export class TaskImagePrismaRepository implements ITaskImageRepository{
    constructor(private prisma: PrismaClient){}

    async find(imageId: number): Promise<TaskImage | null> {
        const image = await this.prisma.taskImage.findUnique(
            {
                where: {id: imageId}
            }
        )

        if (!image)
            return null;

        else
            return new TaskMapper().mapImageToDomain(image);
    }

    async create(taskImage: Omit<TaskImage,  'id' | 'createdAt' | 'updatedAt'>): Promise<TaskImage|null> {
        const newTaskImage = await this.prisma.taskImage.create({
            data: {
                task: {connect: { id: taskImage.taskId }},
                filename: taskImage.filename,
                storedName: taskImage.filename,
                mimetype: taskImage.mimetype,
                size: taskImage.size,
                width: taskImage.width,
                height: taskImage.height,
                url: taskImage.url,
                thumbnailUrl: taskImage.thumbnailUrl,
                order: await this.prisma.taskImage.count({ where: {task: {is:{id:  taskImage.taskId }} }})
            }
        })

        if (!taskImage)
            throw new Error("Failed to create task image");

        return new TaskMapper().mapImageToDomain(newTaskImage);
    }
    async delete(imageId: number): Promise<boolean> {
        const deleteImg = await this.prisma.taskImage.delete({where: {id:imageId}});

        if (!deleteImg)
            return false;

        return true;
    }


    findAll(): Promise<TaskImage[]> {
        throw new Error("Method not implemented.");
    }
    findByTaskId(taskId: number): Promise<TaskImage[]> {
        throw new Error("Method not implemented.");
    }
    async countByTaskId(taskId: number): Promise<number> {
        return await this.prisma.taskImage.count({where: {task:{is: {id: taskId}}}});
    }
}