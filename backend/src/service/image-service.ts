import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { ITaskImageRepository } from 'src/repositories/task-image-repository.interface';

export interface ProcessedImage {
    original: string; //путь к оригинальному изображению
    thumbnail: string;//путь превью
    url: string; // public url
    thumbnailUrl: string; // public url для превью
    size: number; // размер оригинального файла в байтах
    width: number; 
    height: number;
}

export class ImageService {
    private readonly baseUrl: string;
    private repository: ITaskImageRepository;

    constructor(baseUrl: string = process.env.BASE_UPLOADS_URL || 'http://localhost:3000/uploads', imageRepository: ITaskImageRepository) {
        console.log("called image service ctor, baseurl", baseUrl);
        this.baseUrl = baseUrl;
        this.repository = imageRepository;
    }

    async create(taskId: number, file: Express.Multer.File){
        const processed = await this.processImage(file.path);
                    const taskImage = await this.repository.create({
                        taskId,
                        filename: file.originalname,
                        storedName: file.filename,
                        mimetype: file.mimetype,
                        size: file.size,
                        width: processed.width,
                        height: processed.height,
                        url: processed.url,
                        thumbnailUrl: processed.thumbnailUrl,
                        order: (await this.repository.countByTaskId(taskId)),
                    // Порядок - количество уже существующих изображений для этой задачи
                    });

        return taskImage;
    }

    async find(imageId: number){
        return this.repository.find(imageId);
    }

    async delete(imageId : number){
        const taskImage = await this.repository.find(imageId);

        if (taskImage)

        await this.deleteImage(taskImage.storedName);
        const res = await this.repository.delete(imageId);
        if (res)
            console.log('deleted successfule', imageId);
    }

    async processImage(filePath: string): Promise<ProcessedImage> {
        const ext = path.extname(filePath);
        const name = path.basename(filePath, ext);

        const thumbnailPath = path.join(path.dirname(filePath), `thumb_${name}${ext}`);

        const originalMetadata = await sharp(filePath).metadata();
        const stats = await fs.stat(filePath);

        await sharp(filePath)
            .resize({width: 300, withoutEnlargement: true})
            .toFile(thumbnailPath);
        
        return {
            original: filePath,
            thumbnail: thumbnailPath,
            url: `${this.baseUrl}/${path.basename(filePath)}`,
            thumbnailUrl: `${this.baseUrl}/${path.basename(thumbnailPath)}`,
            size: stats.size,
            width: originalMetadata.width || 0,
            height: originalMetadata.height || 0,
        };
    }

    async deleteImage(filePath: string): Promise<void> {
        await fs.unlink(filePath).catch(() => {}); // Игнорируем ошибки при удалении

        const dir = path.dirname(filePath);
        const name = path.basename(filePath);
        const thumbPath = path.join(dir, `thumb_${name}`);
        await fs.unlink(thumbPath).catch(() => {}); // Игнорируем ошибки при удалении
    }

}