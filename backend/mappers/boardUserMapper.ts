import {Board as PrismaBoard, Permission as PrismaPermission, BoardUser as PrismaBoardUser, User as PrismaUser} from "../generated/prisma/client.ts"
import {BoardUser, User, Board} from "../../shared/types.ts"
import { IMapper } from "./Mapper.interface.ts"
import { BoardMapper } from "./boardMapper.ts";
import { UserMapper } from "./userMapper.ts";

type BoardUserWithUser = PrismaBoardUser & { user: PrismaUser };

export class BoardUserMapper implements IMapper<BoardUser, PrismaBoardUser>{
    // Маппинг enum Prisma → ваш интерфейс
    static mapPermission(prismaPerm: PrismaPermission): 'edit' | 'drag-n-drop' | 'view-only' | 'owner' {
        const map: Record<PrismaPermission, 'edit' | 'drag-n-drop' | 'view-only' | 'owner'> = {
        EDIT: 'edit',
        DRAG_N_DROP: 'drag-n-drop',
        VIEW_ONLY: 'view-only',
        OWNER: 'owner',
        };
        return map[prismaPerm];
    }

    //маппинг в другую сторону
    static mapPrismaPermission(permission: 'edit' | 'drag-n-drop' | 'view-only' | 'owner'): PrismaPermission {
        const map: Record<'edit' | 'drag-n-drop' | 'view-only' | 'owner', PrismaPermission> = {
            'edit': PrismaPermission.EDIT,
            'drag-n-drop': PrismaPermission.DRAG_N_DROP,
            'view-only': PrismaPermission.VIEW_ONLY,
            'owner': PrismaPermission.OWNER,
        };
        return map[permission];
    }


    toDomain(prismaBoardUser: BoardUserWithUser): BoardUser {
    return {
      boardId: prismaBoardUser.boardId,
      userId: prismaBoardUser.userId,
      // Опционально добавляем имя пользователя, если оно подгружено
      userName: prismaBoardUser.user?.name,
      permission:   BoardUserMapper.mapPermission(prismaBoardUser.permission),
    };
    }
    toDomainMany(prismaBoardUsers: BoardUserWithUser[]): BoardUser[] {
    return prismaBoardUsers.map(bu => this.toDomain(bu));
    }
}