// frontend/src/components/SocketTest.tsx
import { useEffect } from 'react';
import { socketService } from '../socket/socket-service';

export const SocketTest = () => {
  useEffect(() => {
    console.log('🧪 SocketTest mounted');

    // Глобальный логгер
    const unlisten = socketService.socket?.onAny((event, ...args) => {
      console.log(`🌐 [GLOBAL] ${event}:`, args);
    });

    // Кастомный хендлер
    const handleTest = (message: string) => {
      console.log('🎯 [CUSTOM] test:event received:', message);
      alert('Custom handler works!');
    };

    socketService.socket?.on('test:event', handleTest);

    return () => {
      console.log('🧹 SocketTest cleanup');
      //unlisten?.();
      socketService.socket?.off('test:event', handleTest);
    };
  }, []);

  return <div>Socket Test Component — check console</div>;
};