import {$Enums, ShareLink as PrismaShareLink, Permission as PrismaPermission} from "@prisma/client";

import { ShareLink } from "../../../shared/types";
import { IMapper } from "./Mapper.interface";


export class ShareLinkMapper implements IMapper<ShareLink, PrismaShareLink>{

    static mapPermission(prismaPerm: PrismaPermission): 'edit' | 'drag-n-drop' | 'view-only' | 'owner' {
        const map: Record<PrismaPermission, 'edit' | 'drag-n-drop' | 'view-only' | 'owner'> = {
        EDIT: 'edit',
        DRAG_N_DROP: 'drag-n-drop',
        VIEW_ONLY: 'view-only',
        OWNER: 'owner',
        };
        return map[prismaPerm];
    }
    
    static mapPrismaPermission(permission: 'edit' | 'drag-n-drop' | 'view-only' | 'owner'): PrismaPermission {
        const map: Record<'edit' | 'drag-n-drop' | 'view-only' | 'owner', PrismaPermission> = {
            'edit': PrismaPermission.EDIT,
            'drag-n-drop': PrismaPermission.DRAG_N_DROP,
            'view-only': PrismaPermission.VIEW_ONLY,
            'owner': PrismaPermission.OWNER,
        };
        return map[permission];
    }

    toDomain(dbModel: { id: string; boardId: number; permission: $Enums.Permission; expiresAt: Date | null; }): ShareLink {
        return {
            id: dbModel.id,
            boardId: dbModel.boardId,
            permission: ShareLinkMapper.mapPermission(dbModel.permission),
            expiresAt: dbModel.expiresAt ? dbModel.expiresAt.toISOString() : undefined
        } as ShareLink;
    }
    toDomainMany(dbModels: { id: string; boardId: number; permission: $Enums.Permission; expiresAt: Date | null; }[]): ShareLink[] {
        return dbModels.map(dbModel => this.toDomain(dbModel));
    }
}