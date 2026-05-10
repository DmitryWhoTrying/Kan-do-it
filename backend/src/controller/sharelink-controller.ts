import {Request, Response} from 'express';
import { ShareLinkService } from '../service/sharelink-service';
import { BoardUserService } from 'src/service/board-user-service';

export class ShareLinkController{
    constructor(
        private shareLinkService: ShareLinkService,
        private boardUserService: BoardUserService
    ){};

    async HandleJoinByLink(req: Request, res: Response){
        const linkId = req.params.linkId;
        const userId = req.params.userId;

        try {
            const shareLink = await this.shareLinkService.findById(String(linkId));
            const boardUser = await this.boardUserService.create({
                userId: Number(userId),
                boardId: shareLink.boardId,
                permission: shareLink.permission
            });
            res.status(200).json({success: true, data: boardUser});
        } catch (error) {
            res.status(404).json({success:false, error: (error as Error).message });
        }
    }

    async create(req: Request, res: Response){
        const { boardId, expiresAt, permission } = req.body;

        try{
            const shareLink = await this.shareLinkService.create({
                boardId,
                expiresAt,
                permission
            });
            res.status(201).json({success: true, data: shareLink});
        } catch (error) {
            res.status(400).json({success:false, error: (error as Error).message });
        }
    }

    async deleteLink(req: Request, res:Response){
        const {linkId} = req.params;

        try{
            await this.shareLinkService.delete(String(linkId));
            res.status(200).json({success: true, data: "Share link deleted successfully"});
        } catch (error) {
            res.status(400).json({success:false, error: (error as Error).message });
        }
    }

    async deleteAllLinksForBoard(req: Request, res:Response){
        const {boardId} = req.params;

        try{
            await this.shareLinkService.deleteByBoard(Number(boardId));
            res.status(200).json({success: true, data: "All share links for the board deleted successfully"});
        } catch (error) {
            res.status(400).json({success:false, error: (error as Error).message });
        }
    }

}