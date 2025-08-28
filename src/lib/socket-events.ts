import { CardValue, Session, Participant } from '@/types/session';

export interface ClientToServerEvents {
  'session:create': (data: { topic?: string; creatorName: string }, callback: (response: { sessionId: string }) => void) => void;
  'session:join': (data: { sessionId: string; name: string }, callback: (response: { session: Session; participantId: string }) => void) => void;
  'vote:cast': (data: { sessionId: string; value: CardValue }, callback: (response: { ok: boolean }) => void) => void;
  'round:reveal': (data: { sessionId: string }, callback: (response: { ok: boolean }) => void) => void;
  'round:reset': (data: { sessionId: string }, callback: (response: { ok: boolean }) => void) => void;
}

export interface ServerToClientEvents {
  'session:state': (data: { session: Session }) => void;
  'participant:joined': (data: { participant: Participant }) => void;
  'participant:left': (data: { participantId: string }) => void;
  'vote:updated': (data: { participantId: string }) => void;
  'round:revealed': (data: { stats: any; round: any }) => void;
  'round:reset': (data: { round: any }) => void;
}
