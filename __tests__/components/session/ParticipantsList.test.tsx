import React from 'react';
import { render, screen } from '@testing-library/react';
import ParticipantsList from '@/components/session/ParticipantsList';
import { Participant, Round } from '@/types/session';

describe('ParticipantsList', () => {
  const mockParticipants: Participant[] = [
    {
      id: 'participant-1',
      name: 'Alice',
      joinedAt: Date.now(),
      isOnline: true
    },
    {
      id: 'participant-2', 
      name: 'Bob',
      joinedAt: Date.now(),
      isOnline: false
    },
    {
      id: 'participant-3',
      name: 'Charlie',
      joinedAt: Date.now(),
      isOnline: true
    }
  ];

  const mockRoundWithVotes: Round = {
    id: 'round-1',
    votes: {
      'participant-1': 5,
      'participant-2': 8
    }
  };

  const mockRoundWithoutVotes: Round = {
    id: 'round-2',
    votes: {}
  };

  it('renders participant count correctly', () => {
    render(
      <ParticipantsList
        participants={mockParticipants}
        currentRound={mockRoundWithoutVotes}
        isRoundRevealed={false}
      />
    );

    expect(screen.getByText('参加者 (3)')).toBeInTheDocument();
  });

  it('renders all participant names', () => {
    render(
      <ParticipantsList
        participants={mockParticipants}
        currentRound={mockRoundWithoutVotes}
        isRoundRevealed={false}
      />
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('shows online status indicators correctly', () => {
    render(
      <ParticipantsList
        participants={mockParticipants}
        currentRound={mockRoundWithoutVotes}
        isRoundRevealed={false}
      />
    );

    const aliceRow = screen.getByText('Alice').closest('div');
    const bobRow = screen.getByText('Bob').closest('div');

    expect(aliceRow?.querySelector('.bg-green-500')).toBeInTheDocument();
    
    expect(bobRow?.querySelector('.bg-gray-400')).toBeInTheDocument();
  });

  it('shows voting status when round is not revealed', () => {
    render(
      <ParticipantsList
        participants={mockParticipants}
        currentRound={mockRoundWithVotes}
        isRoundRevealed={false}
      />
    );

    expect(screen.getAllByText('投票済み')).toHaveLength(2);
    
    expect(screen.getByText('未投票')).toBeInTheDocument();
  });

  it('shows actual votes when round is revealed', () => {
    render(
      <ParticipantsList
        participants={mockParticipants}
        currentRound={mockRoundWithVotes}
        isRoundRevealed={true}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument(); // Alice's vote
    expect(screen.getByText('8')).toBeInTheDocument(); // Bob's vote
    
    expect(screen.getByText('未投票')).toBeInTheDocument();
  });

  it('shows 未投票 for participants without votes', () => {
    render(
      <ParticipantsList
        participants={mockParticipants}
        currentRound={mockRoundWithoutVotes}
        isRoundRevealed={false}
      />
    );

    expect(screen.getAllByText('未投票')).toHaveLength(3);
  });

  it('handles empty participants list', () => {
    render(
      <ParticipantsList
        participants={[]}
        currentRound={mockRoundWithoutVotes}
        isRoundRevealed={false}
      />
    );

    expect(screen.getByText('参加者 (0)')).toBeInTheDocument();
  });

  it('handles question mark votes correctly when revealed', () => {
    const roundWithQuestionMark: Round = {
      id: 'round-3',
      votes: {
        'participant-1': '?',
        'participant-2': 3
      }
    };

    render(
      <ParticipantsList
        participants={mockParticipants.slice(0, 2)}
        currentRound={roundWithQuestionMark}
        isRoundRevealed={true}
      />
    );

    expect(screen.getByText('?')).toBeInTheDocument(); // Alice's vote
    expect(screen.getByText('3')).toBeInTheDocument(); // Bob's vote
  });

  it('applies correct CSS classes for vote status badges', () => {
    render(
      <ParticipantsList
        participants={mockParticipants}
        currentRound={mockRoundWithVotes}
        isRoundRevealed={false}
      />
    );

    const votedBadges = screen.getAllByText('投票済み');
    votedBadges.forEach(badge => {
      expect(badge).toHaveClass('bg-green-100', 'text-green-700');
    });

    const unvotedBadge = screen.getByText('未投票');
    expect(unvotedBadge).toHaveClass('bg-gray-100', 'text-gray-600');
  });

  it('applies correct CSS classes for revealed vote badges', () => {
    render(
      <ParticipantsList
        participants={mockParticipants}
        currentRound={mockRoundWithVotes}
        isRoundRevealed={true}
      />
    );

    const voteBadge5 = screen.getByText('5');
    const voteBadge8 = screen.getByText('8');
    
    expect(voteBadge5).toHaveClass('bg-blue-100', 'text-blue-700');
    expect(voteBadge8).toHaveClass('bg-blue-100', 'text-blue-700');
  });
});
