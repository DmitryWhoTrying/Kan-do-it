import {Board as PrismaBoard, Permission as PrismaPermission, BoardUser as PrismaBoardUser, User as PrismaUser} from "../generated/prisma/client"
import {BoardUser, User, Board} from "../../shared/types"
import { IMapper } from "./mapper.interface"
import { BoardMapper } from "./boardMapper";
import { UserMapper } from "./userMapper";

export class BoardUserMapper implements IMapper<BoardUser, PrismaBoardUser>{
    // Маппинг enum Prisma → ваш интерфейс
    private static mapPermission(prismaPerm: PrismaPermission): 'edit' | 'drag-n-drop' | 'view-only' | 'owner' {
        const map: Record<PrismaPermission, 'edit' | 'drag-n-drop' | 'view-only' | 'owner'> = {
        EDIT: 'edit',
        DRAG_N_DROP: 'drag-n-drop',
        VIEW_ONLY: 'view-only',
        OWNER: 'owner',
        };
        return map[prismaPerm];
    }
    
    toDomain(prismaBoardUser: PrismaBoardUser & {prismaBoard : PrismaBoard, prismaUser: PrismaUser}): BoardUser {
        if (!prismaBoardUser.prismaUser){
            throw new Error("Cannot convert to domain, user was null");
        }
        if (!prismaBoardUser.prismaBoard){
            throw new Error("Cannot convert to domain, board was null");
        }
        return {
            permission: BoardUserMapper.mapPermission(prismaBoardUser.permission),
            user:   new UserMapper().toDomain(prismaBoardUser.prismaUser),
            board: new BoardMapper().toDomain(prismaBoardUser.prismaBoard)
        }
    }
    toDomainMany(prismaBoardUser: (PrismaBoardUser & {prismaBoard : PrismaBoard, prismaUser: PrismaUser})[]): BoardUser[] {
        return prismaBoardUser.map(BU => this.toDomain(BU));
    }
}