import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { sessionStorage } from '@/lib/session-storage';
import { createSessionId, createParticipantId } from '@/lib/session-utils';
import { ClientToServerEvents, ServerToClientEvents } from '@/lib/socket-events';
import { Session, Participant, Round } from '@/types/session';

export const runtime = 'nodejs';

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;

export async function GET(req: NextRequest) {
  if (!io) {
    const httpServer = new HTTPServer();
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('session:create', ({ topic, creatorName }, callback) => {
        const sessionId = createSessionId();
        const participantId = createParticipantId();
        
        const participant: Participant = {
          id: participantId,
          name: creatorName,
          joinedAt: Date.now(),
          isOnline: true
        };

        const round: Round = {
          id: createParticipantId(),
          votes: {}
        };

        const session: Session = {
          id: sessionId,
          topic,
          participants: [participant],
          currentRound: round,
          history: [],
          createdAt: Date.now()
        };

        sessionStorage.createSession(session);
        socket.join(`session:${sessionId}`);
        
        callback({ sessionId });
        socket.to(`session:${sessionId}`).emit('session:state', { session });
      });

      socket.on('session:join', ({ sessionId, name }, callback) => {
        const session = sessionStorage.getSession(sessionId);
        if (!session) {
          callback({ session: null as any, participantId: '' });
          return;
        }

        const participantId = createParticipantId();
        const participant: Participant = {
          id: participantId,
          name,
          joinedAt: Date.now(),
          isOnline: true
        };

        const updatedSession = sessionStorage.addParticipant(sessionId, participant);
        if (updatedSession) {
          socket.join(`session:${sessionId}`);
          callback({ session: updatedSession, participantId });
          socket.to(`session:${sessionId}`).emit('participant:joined', { participant });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  return new Response('Socket.IO server initialized', { status: 200 });
}
