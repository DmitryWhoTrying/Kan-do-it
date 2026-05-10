import { PrismaClient } from "@prisma/client";
import { Permission, ShareLink } from "../../../shared/types";
import { IShareLinkRepository } from "./sharelink-repository.interface";
import { ShareLinkMapper } from "src/mappers/ShareLinkMapper";
import { BoardUserMapper } from "src/mappers/BoardUserMapper";

export class PrismaShareLinkRepository implements IShareLinkRepository {
    constructor(private prisma: PrismaClient){};

    async find(boardId: number, permission: 'edit' | 'drag-n-drop' | 'view-only' | 'owner'): Promise<ShareLink | null> {
        const prismaShareLink = await this.prisma.shareLink.findFirst({
            where: {
                boardId,
                permission: ShareLinkMapper.mapPrismaPermission(permission)
            }
        });

        if (prismaShareLink)
            return new ShareLinkMapper().toDomain(prismaShareLink);

        return null;
    }

    async findById(id: string): Promise<ShareLink | null> {
        
        const prismaShareLink = await this.prisma.shareLink.findUnique({
            where: {id}
        });

        if (prismaShareLink)
            return new ShareLinkMapper().toDomain(prismaShareLink);

        return null;
    }
    async findByBoardId(boardId: number): Promise<ShareLink[] | null> {
        const prismaShareLinks = await this.prisma.shareLink.findMany({
            where: {boardId}
        });

        return new ShareLinkMapper().toDomainMany(prismaShareLinks);
    }
    
    async create(shareLink: Omit<ShareLink, "id">): Promise<ShareLink> {
        
        const prismaShareLink = await this.prisma.shareLink.create({
            data:{
                boardId: shareLink.boardId,
                permission: ShareLinkMapper.mapPrismaPermission(shareLink.permission),
                expiresAt: shareLink.expiresAt ? new Date(shareLink.expiresAt) : null
            }
        });

        return new ShareLinkMapper().toDomain(prismaShareLink);
    }

    async update(id: string, data: Partial<ShareLink>): Promise<ShareLink | null> {
        const prismaShareLink = await this.prisma.shareLink.update({
            where: {id},
            data:{
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
                permission: data.permission ? ShareLinkMapper.mapPrismaPermission(data.permission) : undefined
            }
        });

        if (prismaShareLink)
            return new ShareLinkMapper().toDomain(prismaShareLink);
        return null;
    }

    async delete(id: string): Promise<boolean> {
        const prismaShareLink = await this.prisma.shareLink.delete({
            where: {id}
        });

        if (prismaShareLink)
            return true;
        return false;
    }

     async deleteByBoard(boardId: number): Promise<boolean> {
        const result = await this.prisma.shareLink.deleteMany({
            where: {boardId}
        });
        
        if (result)
            return true;
        return false;
    }


    async findAll(): Promise<ShareLink[]> {
        const prismaShareLinks = await this.prisma.shareLink.findMany({});

        return new ShareLinkMapper().toDomainMany(prismaShareLinks);
    }

}