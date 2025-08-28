import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VotingPanel from '@/components/session/VotingPanel';
import { CardValue } from '@/types/session';

describe('VotingPanel', () => {
  const mockOnVoteSelect = jest.fn();

  beforeEach(() => {
    mockOnVoteSelect.mockClear();
  });

  it('renders the voting panel title', () => {
    render(
      <VotingPanel
        selectedVote={null}
        isRoundRevealed={false}
        onVoteSelect={mockOnVoteSelect}
      />
    );

    expect(screen.getByText('カードを選択')).toBeInTheDocument();
  });

  it('renders all Fibonacci card values', () => {
    render(
      <VotingPanel
        selectedVote={null}
        isRoundRevealed={false}
        onVoteSelect={mockOnVoteSelect}
      />
    );

    const expectedValues: CardValue[] = [0, 1, 2, 3, 5, 8, 13, 21, '?'];
    expectedValues.forEach(value => {
      expect(screen.getByText(value.toString())).toBeInTheDocument();
    });
  });

  it('shows instruction text when round is not revealed', () => {
    render(
      <VotingPanel
        selectedVote={null}
        isRoundRevealed={false}
        onVoteSelect={mockOnVoteSelect}
      />
    );

    expect(screen.getByText('ストーリーポイントを選択してください')).toBeInTheDocument();
  });

  it('shows revealed message when round is revealed', () => {
    render(
      <VotingPanel
        selectedVote={null}
        isRoundRevealed={true}
        onVoteSelect={mockOnVoteSelect}
      />
    );

    expect(screen.getByText('結果が公開されました。新しいラウンドを開始してください。')).toBeInTheDocument();
  });

  it('calls onVoteSelect when a card is clicked', () => {
    render(
      <VotingPanel
        selectedVote={null}
        isRoundRevealed={false}
        onVoteSelect={mockOnVoteSelect}
      />
    );

    const card8 = screen.getByText('8');
    fireEvent.click(card8);

    expect(mockOnVoteSelect).toHaveBeenCalledTimes(1);
    expect(mockOnVoteSelect).toHaveBeenCalledWith(8);
  });

  it('shows selected vote indicator when vote is selected', () => {
    render(
      <VotingPanel
        selectedVote={21}
        isRoundRevealed={false}
        onVoteSelect={mockOnVoteSelect}
      />
    );

    expect(screen.getByText('選択中:')).toBeInTheDocument();
    const selectedIndicator = screen.getByText('選択中:').closest('div');
    expect(selectedIndicator).toHaveTextContent('21');
  });

  it('disables cards when round is revealed', () => {
    render(
      <VotingPanel
        selectedVote={null}
        isRoundRevealed={true}
        onVoteSelect={mockOnVoteSelect}
      />
    );

    const card5 = screen.getByText('5');
    expect(card5.closest('button')).toBeDisabled();
  });

  it('does not show selected vote indicator when round is revealed', () => {
    render(
      <VotingPanel
        selectedVote={5}
        isRoundRevealed={true}
        onVoteSelect={mockOnVoteSelect}
      />
    );

    expect(screen.queryByText('選択中:')).not.toBeInTheDocument();
  });

  it('handles question mark vote selection', () => {
    render(
      <VotingPanel
        selectedVote={null}
        isRoundRevealed={false}
        onVoteSelect={mockOnVoteSelect}
      />
    );

    const questionCard = screen.getByText('?');
    fireEvent.click(questionCard);

    expect(mockOnVoteSelect).toHaveBeenCalledWith('?');
  });

  it('shows selected question mark vote', () => {
    render(
      <VotingPanel
        selectedVote="?"
        isRoundRevealed={false}
        onVoteSelect={mockOnVoteSelect}
      />
    );

    expect(screen.getByText('選択中:')).toBeInTheDocument();
    const selectedIndicators = screen.getAllByText('?');
    expect(selectedIndicators.length).toBeGreaterThan(1);
  });
});
