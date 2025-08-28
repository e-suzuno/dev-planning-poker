import { NextRequest, NextResponse } from 'next/server';
import { sessionStorage } from '@/lib/session-storage';
import { validateSessionId } from '@/lib/session-utils';
import { CardValue } from '@/types/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  
  if (!validateSessionId(sessionId)) {
    return NextResponse.json({ error: 'Invalid session ID format' }, { status: 400 });
  }

  try {
    const { participantId, value }: { participantId: string; value: CardValue } = await request.json();
    
    if (!participantId || value === undefined) {
      return NextResponse.json({ error: 'Missing participantId or value' }, { status: 400 });
    }

    const session = sessionStorage.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.currentRound.revealedAt) {
      return NextResponse.json({ error: 'Round already revealed' }, { status: 400 });
    }

    const updatedSession = sessionStorage.castVote(sessionId, participantId, value);
    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
