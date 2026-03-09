import { 
  Board as PrismaBoard, 
  Column as PrismaColumn, 
  Task as PrismaTask,
  BoardUser as PrismaBoardUser, 
  User as PrismaUser,
  Permission as PrismaPermission 
} from '../../generated/prisma/client';

// Board с подгруженными отношениями для маппинга
export type BoardWithRelations = PrismaBoard & {
  columns?: (PrismaColumn & { tasks?: PrismaTask[] })[];
  users?: (PrismaBoardUser & { user: PrismaUser })[];
};

export type BoardUserWithUser = PrismaBoardUser & { user: PrismaUser };