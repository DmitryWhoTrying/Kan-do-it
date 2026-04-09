// src/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { socketService } from './socket-service';
import { Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const skt = socketService.getSocket();
    setSocket(skt);
    setIsConnected(skt?.connected ?? false);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    skt?.on('connect', handleConnect);
    skt?.on('disconnect', handleDisconnect);

    return () => {
      skt?.off('connect', handleConnect);
      skt?.off('disconnect', handleDisconnect);
    };
  }, []);

  return { socket, isConnected };
};