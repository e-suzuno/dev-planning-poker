import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from './socket-events';
import { Session, Participant, CardValue } from '@/types/session';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useSocket(sessionId?: string) {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Socket.IO client connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO client disconnected');
      setIsConnected(false);
    });

    socketInstance.on('session:state', ({ session }) => {
      setSession(session);
    });

    socketInstance.on('participant:joined', ({ participant }) => {
      setSession(prev => prev ? {
        ...prev,
        participants: [...prev.participants, participant]
      } : null);
    });

    socketInstance.on('participant:left', ({ participantId }) => {
      setSession(prev => prev ? {
        ...prev,
        participants: prev.participants.map(p => 
          p.id === participantId ? { ...p, isOnline: false } : p
        )
      } : null);
    });

    socketInstance.on('vote:updated', ({ participantId }) => {
    });

    socketInstance.on('round:revealed', ({ stats, round }) => {
      setSession(prev => prev ? {
        ...prev,
        currentRound: round
      } : null);
    });

    socketInstance.on('round:reset', ({ round }) => {
      setSession(prev => prev ? {
        ...prev,
        currentRound: round,
        history: prev.history
      } : null);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [sessionId]);

  const joinSession = (name: string) => {
    if (!socket || !sessionId) {
      console.log('Cannot join session: socket or sessionId missing', { socket: !!socket, sessionId });
      return;
    }
    
    console.log('Attempting to join session:', { sessionId, name });
    socket.emit('session:join', { sessionId, name }, ({ session, participantId }) => {
      console.log('Session join response:', { session: !!session, participantId });
      if (session) {
        setSession(session);
        setParticipantId(participantId);
      }
    });
  };

  const castVote = (value: CardValue) => {
    if (!socket || !sessionId || !participantId) return;
    
    socket.emit('vote:cast', { sessionId, participantId, value }, ({ ok }) => {
      if (!ok) {
        console.error('Failed to cast vote');
      }
    });
  };

  const revealRound = () => {
    if (!socket || !sessionId) return;
    
    socket.emit('round:reveal', { sessionId }, ({ ok }) => {
      if (!ok) {
        console.error('Failed to reveal round');
      }
    });
  };

  const resetRound = () => {
    if (!socket || !sessionId) return;
    
    socket.emit('round:reset', { sessionId }, ({ ok }) => {
      if (!ok) {
        console.error('Failed to reset round');
      }
    });
  };

  return {
    socket,
    isConnected,
    session,
    participantId,
    joinSession,
    castVote,
    revealRound,
    resetRound
  };
}
