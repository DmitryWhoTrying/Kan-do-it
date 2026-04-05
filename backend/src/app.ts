import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { prisma } from './Lib/prisma';
import { registerSocketHandlers } from './socket/socket-gateway';
import { createBoardRoutes } from './routes/board.routes';
import { createUserRoutes } from './routes/user.routes';
import { createBoardUserRoutes } from './routes/boarduser.routes';
//import { createTaskRoutes } from './routes/task.routes';
//import { createColumnRoutes } from './routes/column.routes';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Безопасность и CORS
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
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

// Регистрация HTTP-роутов
app.use('/api/boards', createBoardRoutes());
app.use('/api/users', createUserRoutes());
app.use('/api/boardUsers', createBoardUserRoutes());
//app.use('/api/columns', createColumnRoutes());
//app.use('/api/tasks', createTaskRoutes());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Глобальный обработчик ошибок Express
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Express error:', err);
  
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

// 404 handler (должен быть последним)
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// 🔌 Инициализация Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Регистрация обработчиков сокетов
registerSocketHandlers(io);

// 🚀 Запуск сервера
const PORT = parseInt(process.env.PORT || '3000', 10);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO ready`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
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