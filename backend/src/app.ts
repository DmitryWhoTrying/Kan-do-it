import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { prisma } from './lib/prisma';
import { registerSocketHandlers } from './socket/socket-gateway';
import { createBoardRoutes } from './routes/board.routes';
import { createUserRoutes } from './routes/user.routes';
import { createBoardUserRoutes } from './routes/boarduser.routes';
import { createAuthRoutes } from './routes/auth.routes';
import 'dotenv/config'

import dotenv from 'dotenv';
import { createColumnRoutes } from './routes/column.routes';
import { createTaskRoutes } from './routes/task.routes';
import { PrismaBoardRepository } from './repositories/board-prisma-repository';
import { BoardController } from './controller/board-controller';
import { BoardService } from './service/board-service';
import { PrimaBoardUserRepository } from './repositories/board-user-prisma-repository';
import { BoardUserService } from './service/board-user-service';
import { BoardUserController } from './controller/board-user-controller';
import { UserPrismaRepository } from './repositories/user-prisma-repository';
import { UserService } from './service/user-service';
import { UserController } from './controller/user-controller';
import { TaskController } from './controller/task-controller';
import { PrismaColumnRepository } from './repositories/column-prisma-repository';
import { ColumnService } from './service/column-service';
import { ColumnController } from './controller/column-controller';
import { PrismaTaskRepository } from './repositories/task-prisma-repository';
import { TaskService } from './service/task-service';
import { AuthController } from './controller/auth-controller';
import { AuthService } from './service/auth-service';
import { createTaskImageRoutes } from './routes/task-image-routes';
import { TaskImageController } from './controller/task-image-controller';
import path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Инициализация Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

const socketEmitter = registerSocketHandlers(io);

// Безопасность и CORS
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true,
}));

// Парсинг тела запроса
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов (опционально)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});


//все контроллеры сервисы и ижэ с ними
const prismaBoardRepo = new PrismaBoardRepository(prisma);
const boardService = new BoardService(prismaBoardRepo);
const boardController = new BoardController(boardService, socketEmitter);

const prismaBoardUserRepo = new PrimaBoardUserRepository(prisma);
const boardUserService = new BoardUserService(prismaBoardUserRepo);
const boardUserController = new BoardUserController(boardUserService);

const prismaUserRepo = new UserPrismaRepository(prisma);
const userService = new UserService(prismaUserRepo);
const userController = new UserController(userService);

const authService = new AuthService(prismaUserRepo);
const authController = new AuthController(authService);

const prismaColummnRepo = new PrismaColumnRepository(prisma);
const columnService = new ColumnService(prismaColummnRepo);
const columnController = new ColumnController(columnService, socketEmitter);

const prismaTaskRepo = new PrismaTaskRepository(prisma);
const taskService = new TaskService(prismaTaskRepo);
const taskController = new TaskController(taskService, socketEmitter);

const taskImageController = new TaskImageController();

console.log('Registering routes...');

//app.use('/api/tasks', createTaskRoutes());
// Регистрация HTTP-роутов
app.use('/api/boards', createBoardRoutes(boardController));
console.log('✓ Boards routes registered');

app.use('/api/users', createUserRoutes(userController));
console.log('✓ User routes registered');

app.use('/api/boardUsers', createBoardUserRoutes(boardUserController));
console.log('✓ Board users routes registered');

app.use('/api/columns', createColumnRoutes(columnController));
console.log('✓ Column routes registered');

app.use('/api/tasks', createTaskRoutes(taskController));
console.log('✓ Task routes registered');

app.use('/api/auth', createAuthRoutes(authController));
console.log('✓ Authentification routes registered')

app.use('/api/images', createTaskImageRoutes(taskImageController))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
console.log('✓ Health routes registered');

// Глобальный обработчик ошибок Express
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Express error ', err);
  
  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({ 
      success: false, 
      error: 'Database error', 
      code: (err as any).code 
    });
  }
  
  // Default error
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1y', // Кэшировать на 1 год
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Разрешить CORS для всех доменов
  }
}));

// 404 handler (должен быть последним)
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Запуск сервера
const PORT = parseInt(process.env.PORT || '3000', 10);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO ready`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export { app, httpServer, io };