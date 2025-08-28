import { NextRequest, NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { sessionStorage } from '@/lib/session-storage';
import { createSessionId, createParticipantId } from '@/lib/session-utils';
import { ClientToServerEvents, ServerToClientEvents } from '@/lib/socket-events';
import { Session, Participant, Round } from '@/types/session';
import { calculateStatistics } from '@/lib/vote-statistics';

export const runtime = 'nodejs';

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;

export async function GET(req: NextRequest) {
  if (!io) {
    console.log('Initializing Socket.IO server...');
    
    if (!(global as any).httpServer) {
      const { createServer } = await import('http');
      (global as any).httpServer = createServer();
      
      const port = process.env.SOCKET_PORT || 3001;
      (global as any).httpServer.listen(port, () => {
        console.log(`Socket.IO server running on port ${port}`);
      });
    }
    
    io = new SocketIOServer((global as any).httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : '*',
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      path: '/socket.io/'
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
        console.log(`Attempting to join session: ${sessionId}`);
        console.log('Available sessions:', sessionStorage.getAllSessions().map(s => s.id));
        const session = sessionStorage.getSession(sessionId);
        if (!session) {
          console.log(`Session ${sessionId} not found in Socket.IO storage`);
          callback({ session: null as any, participantId: '' });
          return;
        }

        const participantId = socket.id;
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

      socket.on('vote:cast', ({ sessionId, participantId, value }, callback) => {
        const session = sessionStorage.getSession(sessionId);
        if (!session) {
          callback({ ok: false });
          return;
        }

        if (session.currentRound.revealedAt) {
          callback({ ok: false });
          return;
        }

        const updatedSession = sessionStorage.castVote(sessionId, participantId, value);
        if (updatedSession) {
          callback({ ok: true });
          socket.to(`session:${sessionId}`).emit('vote:updated', { participantId });
          socket.to(`session:${sessionId}`).emit('session:state', { session: updatedSession });
        } else {
          callback({ ok: false });
        }
      });

      socket.on('round:reveal', ({ sessionId }, callback) => {
        const updatedSession = sessionStorage.revealRound(sessionId);
        if (updatedSession) {
          callback({ ok: true });
          const stats = calculateStatistics(updatedSession.currentRound.votes);
          io.to(`session:${sessionId}`).emit('round:revealed', { stats, round: updatedSession.currentRound });
          io.to(`session:${sessionId}`).emit('session:state', { session: updatedSession });
        } else {
          callback({ ok: false });
        }
      });

      socket.on('round:reset', ({ sessionId }, callback) => {
        const updatedSession = sessionStorage.resetRound(sessionId);
        if (updatedSession) {
          callback({ ok: true });
          io.to(`session:${sessionId}`).emit('round:reset', { round: updatedSession.currentRound });
          io.to(`session:${sessionId}`).emit('session:state', { session: updatedSession });
        } else {
          callback({ ok: false });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        const sessions = sessionStorage.getAllSessions();
        for (const session of sessions) {
          const participant = session.participants.find(p => p.id === socket.id);
          if (participant) {
            participant.isOnline = false;
            sessionStorage.updateSession(session.id, session);
            socket.to(`session:${session.id}`).emit('session:state', { session });
            socket.to(`session:${session.id}`).emit('participant:left', { participantId: participant.id });
            break;
          }
        }
      });
    });
  }

  return new Response('Socket.IO server initialized', { status: 200 });
}
