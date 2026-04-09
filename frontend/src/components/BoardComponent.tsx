import React, {useEffect, useCallback} from "react";
import {useSocket} from '../../socket/socket-hooks';
import { socketService } from "../../socket/socket-service";

interface BoardProps{
    boardId: number;
    userId: number;
}

export const BoardComponent: React.FC<BoardProps> = ({boardId, userId}) => {
    
}