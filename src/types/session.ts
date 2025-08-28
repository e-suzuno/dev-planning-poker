export type CardValue = 0 | 1 | 2 | 3 | 5 | 8 | 13 | 21 | '?';

export interface Participant {
  id: string;
  name: string;
  joinedAt: number;
  isOnline: boolean;
}

export interface Round {
  id: string;
  votes: Record<string, CardValue | null>;
  revealedAt?: number;
}

export interface Session {
  id: string;
  topic?: string;
  participants: Participant[];
  currentRound: Round;
  history: Round[];
  createdAt: number;
}

export interface CreateSessionRequest {
  topic?: string;
  creatorName: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  joinUrl: string;
}

export interface JoinSessionRequest {
  sessionId: string;
  name: string;
}

export interface JoinSessionResponse {
  session: Session;
  participantId: string;
}
