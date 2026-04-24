import multer from 'multer';
import {v4 as uuidv4} from 'uuid';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(__dirname, '../../uploads/tasks');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


//КОНФИГУРАЦИЯ ДЛЯ ЗАГРУЗКИ ФАЙЛОВ С ПОМОЩЬЮ MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
    filename: (req, file, cb) => {
        const uniqueName =`${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } 
    else{
        cb(new Error('Недопустимый тип файла. Разрешены только изображения.'));
    }
}

export const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}); // Ограничение 5 МБ);
