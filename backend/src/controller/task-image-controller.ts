import { Request, Response } from "express";
import { ImageService} from "src/service/image-service";
import { prisma } from "src/lib/prisma";

import { url } from "node:inspector";

const imageService = new ImageService();

export class TaskImageController {

    //POST /api/tasks/:taskId/images
    async upload(req: Request, res: Response) {
        try{
            const taskId = Number(req.params.taskId);
            const file = req.file;

            if (!file) {
                return res.status(400).json({ success: false, error: 'Файл не найден' });
            }

            const processed = await imageService.processImage(file.path);
            const taskImage = await prisma.taskImage.create({
                data: {
                    taskId,
                    filename: file.originalname,
                    storedName: file.filename,
                    mimetype: file.mimetype,
                    size: file.size,
                    width: processed.width,
                    height: processed.height,
                    url: processed.url,
                    thumbnailUrl: processed.thumbnailUrl,
                    order: await prisma.taskImage.count({ where: { taskId } }) // Порядок - количество уже существующих изображений для этой задачи
                }
            });

            res.status(200).json({ success: true, data: taskImage });
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

            const taskImage = await prisma.taskImage.findUnique({
                where: { id: imageId, taskId }
            });

            if (!taskImage) {
                return res.status(404).json({ success: false, error: 'Image not found' });
            }

            await imageService.deleteImage(taskImage.storedName);
            await prisma.taskImage.delete({ where: { id: imageId } });

            res.status(200).json({ success: true, message: 'Image deleted successfully' });
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