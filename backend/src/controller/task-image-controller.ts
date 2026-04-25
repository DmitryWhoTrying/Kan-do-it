import { Request, Response } from "express";
import { ImageService} from "src/service/image-service";
import { prisma } from "src/lib/prisma";

import { SocketEmitter } from "src/socket/socket-emitter";
import { TaskMapper } from "src/mappers/TaskMapper";


export class TaskImageController {
    constructor(
        private imageService: ImageService, 
        private socketEmitter: SocketEmitter) 
        {}

    //POST /api/tasks/:taskId/images
    async upload(req: Request, res: Response) {
        console.log('🎯 Controller reached:', {
        originalUrl: req.originalUrl,  // Полный URL с префиксом
        url: req.url,                   // URL относительно роутера
        params: req.params
        });

        try{
            console.group('📥 Upload Debug');
            console.log('URL:', req.originalUrl);
            console.log('Content-Type:', req.headers['content-type']);  // ← ВАЖНО!
            console.log('Has file?:', !!req.file);  // ← ВАЖНО!
            console.log('File details:', req.file);  // ← ВАЖНО!
            console.log('Body:', req.body);
            console.groupEnd();
            const taskId = Number(req.params.taskId);
            const file = req.file;

            if (!file) {
                return res.status(400).json({ success: false, error: 'Файл не найден' });
            }

            const createdImage = await this.imageService.create(taskId, file);

            if (!createdImage)
                throw new Error('failed to create image');

            res.status(200).json({ success: true, data: createdImage });
            this.socketEmitter.emitTaskImageAdded(Number(req.params.boardId), taskId, createdImage);
        }
        catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ success: false, error: 'Failed to upload image' });
        }
    }

    //DELETE /api/tasks/:taskId/images/:imageId
    async delete(req: Request, res: Response) {
        try {
            const taskId = Number(req.params.taskId);
            const imageId = Number(req.params.imageId);
            const boardId = Number(req.params.boardId); // Предполагаем, что boardId передается в URL

            const taskImage = await this.imageService.find(imageId);

            if (!taskImage) {
                return res.status(404).json({ success: false, error: 'Image not found' });
            }

            await this.imageService.delete(imageId);

            res.status(200).json({ success: true, message: 'Image deleted successfully' });
            this.socketEmitter.emitTaskImageDeleted(boardId, taskId, imageId);
        } catch (error) {
            console.error('Delete error:', error);
            res.status(500).json({ success: false, error: 'Failed to delete image' });
        }
    }

    //GET /api/tasks/:taskId/images
    async list(req: Request, res: Response) {
        try{
            const taskId = Number(req.params.taskId);
            const images = await prisma.taskImage.findMany({
                where: { taskId },
                orderBy: { order: 'asc' }
            });
            res.status(200).json({ success: true, data: images });
        }
        catch (error) {
            console.error('List error:', error);
            res.status(500).json({ success: false, error: 'Failed to list images' });
        }
    }
}