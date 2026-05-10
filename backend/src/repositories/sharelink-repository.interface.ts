import { ShareLink } from "../../../shared/types";

export interface IShareLinkRepository{
    findById(id: string): Promise<ShareLink | null>;
    findByBoardId(boardId: number): Promise<ShareLink[] | null>;
    find(boardId: number, permission: 'edit' | 'drag-n-drop' | 'view-only' | 'owner'): Promise<ShareLink| null>;

    create(shareLink: Omit<ShareLink, 'id'>): Promise<ShareLink>;
    update(id: string, data: Partial<ShareLink>): Promise<ShareLink | null>;
    delete(id: string): Promise<boolean>;
    deleteByBoard(boardId: number): Promise<boolean>;
    findAll(): Promise<ShareLink[]>;
}