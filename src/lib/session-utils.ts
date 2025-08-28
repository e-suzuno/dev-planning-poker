import { customAlphabet } from 'nanoid';

const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const generateSessionId = customAlphabet(alphabet, 8);

export function createSessionId(): string {
  return generateSessionId();
}

export function createParticipantId(): string {
  return customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 12)();
}

export function validateSessionId(sessionId: string): boolean {
  return /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/.test(sessionId);
}

export function createJoinUrl(sessionId: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/session/${sessionId}`;
}
