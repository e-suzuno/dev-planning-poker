import { Session, Participant, CardValue, Round } from '@/types/session';
import { createParticipantId } from '@/lib/session-utils';

class SessionStorage {
  private sessions: Map<string, Session>;

  constructor() {
    if (!(global as any).sessionStorageMap) {
      (global as any).sessionStorageMap = new Map<string, Session>();
    }
    this.sessions = (global as any).sessionStorageMap;
  }

  createSession(session: Session): void {
    this.sessions.set(session.id, session);
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  updateSession(sessionId: string, updates: Partial<Session>): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const updatedSession = { ...session, ...updates };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  addParticipant(sessionId: string, participant: Participant): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const updatedSession = {
      ...session,
      participants: [...session.participants, participant]
    };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  removeParticipant(sessionId: string, participantId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const updatedSession = {
      ...session,
      participants: session.participants.filter(p => p.id !== participantId)
    };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  cleanupOldSessions(maxAgeHours: number = 24): number {
    const cutoffTime = Date.now() - maxAgeHours * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.createdAt < cutoffTime) {
        this.sessions.delete(sessionId);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  castVote(sessionId: string, participantId: string, value: CardValue): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const updatedSession = {
      ...session,
      currentRound: {
        ...session.currentRound,
        votes: {
          ...session.currentRound.votes,
          [participantId]: value
        }
      }
    };
    
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  revealRound(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const updatedSession = {
      ...session,
      currentRound: {
        ...session.currentRound,
        revealedAt: Date.now()
      }
    };
    
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  resetRound(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const newRound: Round = {
      id: createParticipantId(),
      votes: {}
    };

    const updatedSession = {
      ...session,
      history: [...session.history, session.currentRound],
      currentRound: newRound
    };
    
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }
}

export const sessionStorage = new SessionStorage();
