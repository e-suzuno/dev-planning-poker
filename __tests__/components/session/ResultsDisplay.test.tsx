import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResultsDisplay from '@/components/session/ResultsDisplay';
import { Round } from '@/types/session';

describe('ResultsDisplay', () => {
  const mockOnReveal = jest.fn();
  const mockOnReset = jest.fn();

  beforeEach(() => {
    mockOnReveal.mockClear();
    mockOnReset.mockClear();
  });

  const mockRoundWithVotes: Round = {
    id: 'round-1',
    votes: {
      'participant-1': 5,
      'participant-2': 8,
      'participant-3': 3
    }
  };

  const mockRoundWithoutVotes: Round = {
    id: 'round-2',
    votes: {}
  };

  const mockRoundRevealed: Round = {
    id: 'round-3',
    votes: {
      'participant-1': 5,
      'participant-2': 8,
      'participant-3': 3
    },
    revealedAt: Date.now()
  };

  it('shows voting status when round is not revealed', () => {
    render(
      <ResultsDisplay
        currentRound={mockRoundWithVotes}
        isRevealed={false}
        onReveal={mockOnReveal}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('投票状況')).toBeInTheDocument();
    expect(screen.getByText('3人が投票済み')).toBeInTheDocument();
    expect(screen.queryByText('投票結果')).not.toBeInTheDocument();
  });

  it('shows waiting message when no votes', () => {
    render(
      <ResultsDisplay
        currentRound={mockRoundWithoutVotes}
        isRevealed={false}
        onReveal={mockOnReveal}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('投票を待っています...')).toBeInTheDocument();
  });

  it('shows reveal button when all participants have voted', () => {
    render(
      <ResultsDisplay
        currentRound={mockRoundWithVotes}
        isRevealed={false}
        onReveal={mockOnReveal}
        onReset={mockOnReset}
      />
    );

    const revealButton = screen.getByText('結果を公開');
    expect(revealButton).toBeInTheDocument();
    expect(revealButton).toBeEnabled();
  });

  it('calls onReveal when reveal button is clicked', () => {
    render(
      <ResultsDisplay
        currentRound={mockRoundWithVotes}
        isRevealed={false}
        onReveal={mockOnReveal}
        onReset={mockOnReset}
      />
    );

    const revealButton = screen.getByText('結果を公開');
    fireEvent.click(revealButton);

    expect(mockOnReveal).toHaveBeenCalledTimes(1);
  });

  it('shows statistics when round is revealed', () => {
    render(
      <ResultsDisplay
        currentRound={mockRoundRevealed}
        isRevealed={true}
        onReveal={mockOnReveal}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('投票結果')).toBeInTheDocument();
    expect(screen.getByText('平均値')).toBeInTheDocument();
    expect(screen.getByText('中央値')).toBeInTheDocument();
    expect(screen.getByText('最頻値')).toBeInTheDocument();
  });

  it('shows calculated statistics values', () => {
    render(
      <ResultsDisplay
        currentRound={mockRoundRevealed}
        isRevealed={true}
        onReveal={mockOnReveal}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('5.3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows reset button when round is revealed', () => {
    render(
      <ResultsDisplay
        currentRound={mockRoundRevealed}
        isRevealed={true}
        onReveal={mockOnReveal}
        onReset={mockOnReset}
      />
    );

    const resetButton = screen.getByText('新しいラウンドを開始');
    expect(resetButton).toBeInTheDocument();
    expect(resetButton).toBeEnabled();
  });

  it('calls onReset when reset button is clicked', () => {
    render(
      <ResultsDisplay
        currentRound={mockRoundRevealed}
        isRevealed={true}
        onReveal={mockOnReveal}
        onReset={mockOnReset}
      />
    );

    const resetButton = screen.getByText('新しいラウンドを開始');
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('shows N/A for statistics with non-numeric votes', () => {
    const mixedRound: Round = {
      id: 'round-mixed',
      votes: {
        'participant-1': '?',
        'participant-2': '?'
      },
      revealedAt: Date.now()
    };

    render(
      <ResultsDisplay
        currentRound={mixedRound}
        isRevealed={true}
        onReveal={mockOnReveal}
        onReset={mockOnReset}
      />
    );

    const naElements = screen.getAllByText('N/A');
    expect(naElements.length).toBeGreaterThanOrEqual(2);
  });

  it('handles mixed numeric and non-numeric votes', () => {
    const mixedRound: Round = {
      id: 'round-mixed',
      votes: {
        'participant-1': 5,
        'participant-2': '?',
        'participant-3': 8
      },
      revealedAt: Date.now()
    };

    render(
      <ResultsDisplay
        currentRound={mixedRound}
        isRevealed={true}
        onReveal={mockOnReveal}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('平均値')).toBeInTheDocument();
    expect(screen.getByText('中央値')).toBeInTheDocument();
    expect(screen.getByText('最頻値')).toBeInTheDocument();
    
    const statisticsGrid = screen.getByText('平均値').closest('.grid');
    expect(statisticsGrid).toHaveTextContent('6.5');
  });
});
