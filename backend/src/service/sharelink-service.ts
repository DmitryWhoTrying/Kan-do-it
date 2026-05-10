import { Permission } from "@prisma/client";
import { ShareLink }  from "../../../shared/types";
import { IShareLinkRepository } from "../repositories/sharelink-repository.interface";

export class ShareLinkService{
    constructor(
        private shareLinkRepository: IShareLinkRepository
    ){};

    async findById(id: string){
        const shareLink = await this.shareLinkRepository.findById(id);

        if (!shareLink)
            throw new Error('ShareLink not found');
        
        if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()){
            await this.shareLinkRepository.delete(id);
            throw new Error('ShareLink has expired');
        }

        return shareLink;
    }

    async findExisting(boardId: number, permission: 'edit' | 'drag-n-drop' | 'view-only' | 'owner'){
        const shareLink = await this.shareLinkRepository.find(boardId, permission);

        if (!shareLink){
            throw new Error('ShareLink not found');
        }

        return shareLink;
    }

    async create(data: Omit<ShareLink, 'id'>){
        const shareLink = await this.shareLinkRepository.create(data);
        return shareLink;
    }

    async update(id: string, data: Partial<ShareLink>){
        const shareLink = await this.shareLinkRepository.update(id, data);
        return shareLink;
    }

    async delete(id: string){
        const res = await this.shareLinkRepository.delete(id);
        return res;
    }

    async deleteByBoard(boardId: number){
        const res = await this.shareLinkRepository.deleteByBoard(boardId);
        return res;
    }
}