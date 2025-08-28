import { NextRequest } from 'next/server';
import { POST } from '@/app/api/sessions/[id]/vote/route';
import { sessionStorage } from '@/lib/session-storage';
import { Session, CardValue } from '@/types/session';

describe('/api/sessions/[id]/vote', () => {
  beforeEach(() => {
    const allSessions = sessionStorage.getAllSessions();
    allSessions.forEach(session => {
      sessionStorage.deleteSession(session.id);
    });
  });

  it('successfully casts a vote', async () => {
    const testSession: Session = {
      id: '23456789',
      topic: 'Test Session',
      participants: [
        {
          id: 'participant-1',
          name: 'Alice',
          joinedAt: Date.now(),
          isOnline: true
        }
      ],
      currentRound: {
        id: 'round-1',
        votes: {}
      },
      history: [],
      createdAt: Date.now()
    };
    
    sessionStorage.createSession(testSession);

    const request = new NextRequest(`http://localhost/api/sessions/23456789/vote`, {
      method: 'POST',
      body: JSON.stringify({
        participantId: 'participant-1',
        value: 5
      })
    });

    const params = Promise.resolve({ id: '23456789' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.session.currentRound.votes['participant-1']).toBe(5);
  });

  it('handles question mark votes', async () => {
    const testSession: Session = {
      id: 'TEST4567',
      topic: 'Test Session',
      participants: [
        {
          id: 'participant-1',
          name: 'Alice',
          joinedAt: Date.now(),
          isOnline: true
        }
      ],
      currentRound: {
        id: 'round-1',
        votes: {}
      },
      history: [],
      createdAt: Date.now()
    };
    
    sessionStorage.createSession(testSession);

    const request = new NextRequest('http://localhost/api/sessions/TEST4567/vote', {
      method: 'POST',
      body: JSON.stringify({
        participantId: 'participant-1',
        value: '?'
      })
    });

    const params = Promise.resolve({ id: 'TEST4567' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.session.currentRound.votes['participant-1']).toBe('?');
  });

  it('returns 400 for invalid session ID format', async () => {
    const request = new NextRequest('http://localhost/api/sessions/ABC/vote', {
      method: 'POST',
      body: JSON.stringify({
        participantId: 'participant-1',
        value: 5
      })
    });

    const params = Promise.resolve({ id: 'ABC' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid session ID format');
  });

  it('returns 404 for non-existent session', async () => {
    const request = new NextRequest('http://localhost/api/sessions/ABCDEFGH/vote', {
      method: 'POST',
      body: JSON.stringify({
        participantId: 'participant-1',
        value: 5
      })
    });

    const params = Promise.resolve({ id: 'ABCDEFGH' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Session not found');
  });

  it('returns 400 for missing participantId', async () => {
    const testSession: Session = {
      id: 'TEST7892',
      topic: 'Test Session',
      participants: [],
      currentRound: {
        id: 'round-1',
        votes: {}
      },
      history: [],
      createdAt: Date.now()
    };
    
    sessionStorage.createSession(testSession);

    const request = new NextRequest('http://localhost/api/sessions/TEST7892/vote', {
      method: 'POST',
      body: JSON.stringify({
        value: 5
      })
    });

    const params = Promise.resolve({ id: 'TEST7892' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing participantId or value');
  });

  it('returns 400 when round is already revealed', async () => {
    const testSession: Session = {
      id: 'TEST9999',
      topic: 'Test Session',
      participants: [
        {
          id: 'participant-1',
          name: 'Alice',
          joinedAt: Date.now(),
          isOnline: true
        }
      ],
      currentRound: {
        id: 'round-1',
        votes: {},
        revealedAt: Date.now()
      },
      history: [],
      createdAt: Date.now()
    };
    
    sessionStorage.createSession(testSession);

    const request = new NextRequest('http://localhost/api/sessions/TEST9999/vote', {
      method: 'POST',
      body: JSON.stringify({
        participantId: 'participant-1',
        value: 5
      })
    });

    const params = Promise.resolve({ id: 'TEST9999' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Round already revealed');
  });
});
