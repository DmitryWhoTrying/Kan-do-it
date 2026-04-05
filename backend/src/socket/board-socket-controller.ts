import {Socket, Server} from 'socket.io';
import { BoardService} from '../service/board-service';
import { ClientToServerEvents, ServerToClientEvets } from '../../../shared/socket-events.types';
import { Board } from '../../../shared/types';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvets>;

export class BoardSocketController{
    constructor(
        private BoardService: BoardService,
        private io: Server<ClientToServerEvents, ServerToClientEvets>
    ){};

    handleJoin = async (socket: TypedSocket, boardId: number) =>{
        try{
            const userId = socket.handshake.auth.userId;

            const hasAccess = await this.BoardService.checkUserAccess(boardId, userId);

            if (!hasAccess){
                return socket.emit('error',
                    'Access denied');
            }

            //подключение если есть доступ
            socket.join(`board:${boardId}`);


            //здесь можно сказать другим пользователям что в доску еще кто-то зашел, пока придержим фичу
            //socket.to(`board:${boardId}`).emit

            const board = await this.BoardService.getBoardById(boardId);
            if (board){
                socket.emit('board:state', board);
            }
        }
        catch (err){
            socket.emit('error', 'failed to join board');
        }
    }

    handleLeave = async (socket: TypedSocket, boardId: number) => {
        try {
            const userId = socket.handshake.auth.userId;

            socket.leave(`board:${boardId}`);
        }
        catch (err){
            console.error('Leave error:', err);
        }
    }

    handleUpdate = async (socket: TypedSocket,data:{boardId: number, board: Partial<Board>}) => {
        try {
            const updatedBoard = await this.BoardService.updateBoard(data.board, data.boardId);
            
            if (!updatedBoard)
                return socket.emit('error', 'Cannot find board to update');

            socket.to(`board:${data.boardId}`).emit('board:updated', {boardId : data.boardId, board: updatedBoard});
        }
        catch(err){
            socket.emit('error', 'cannot update with such data');
        }
    }

    handleDelete = async (socket: TypedSocket, boardId: number) => {
        try{
            const userId = socket.handshake.auth.userId;

            const isOwner = await this.BoardService.chechIsOwner(boardId, userId);

            if (!isOwner){
                return socket.emit('error', 'Access denied, not a owner');
            }

            const deleted = await this.BoardService.deleteBoard(boardId);
            if (!deleted)
                return socket.emit('error', 'board not found');

            this.io.to('board').emit('board:deleted', boardId);
            socket.emit('board:delete:success', boardId);
        }
        catch (err) {
            socket.emit('error', 'unexpected error in delete');
        }
    }
}