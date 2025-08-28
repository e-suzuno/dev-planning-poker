import { NextRequest, NextResponse } from 'next/server';
import { sessionStorage } from '@/lib/session-storage';
import { createSessionId, createParticipantId, createJoinUrl } from '@/lib/session-utils';
import { CreateSessionRequest, CreateSessionResponse, Session, Participant, Round } from '@/types/session';

export async function POST(request: NextRequest) {
  try {
    const body: CreateSessionRequest = await request.json();
    const { creatorName, topic } = body;

    if (!creatorName || creatorName.trim().length === 0) {
      return NextResponse.json({ error: 'Creator name is required' }, { status: 400 });
    }

    const sessionId = createSessionId();
    const participantId = createParticipantId();
    
    const participant: Participant = {
      id: participantId,
      name: creatorName.trim(),
      joinedAt: Date.now(),
      isOnline: true
    };

    const round: Round = {
      id: createParticipantId(),
      votes: {}
    };

    const session: Session = {
      id: sessionId,
      topic: topic?.trim(),
      participants: [participant],
      currentRound: round,
      history: [],
      createdAt: Date.now()
    };

    sessionStorage.createSession(session);
    
    const response: CreateSessionResponse = {
      sessionId,
      joinUrl: createJoinUrl(sessionId, request.nextUrl.origin)
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
