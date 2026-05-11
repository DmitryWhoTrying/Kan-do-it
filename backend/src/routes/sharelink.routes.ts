import { Router } from "express";
import { ShareLinkController } from "src/controller/sharelink-controller";

export function createShareLinkRoutes(shareLink : ShareLinkController){
    const router = Router();

    router.get('/', shareLink.findAll.bind(shareLink));
    router.get('/:linkId', shareLink.HandleJoinByLink.bind(shareLink));
    
    router.post('/', shareLink.create.bind(shareLink));
    router.delete('/board/:boardId', shareLink.deleteAllLinksForBoard);
    router.delete('/:linkId', shareLink.deleteLink.bind(shareLink));

    return router;
}