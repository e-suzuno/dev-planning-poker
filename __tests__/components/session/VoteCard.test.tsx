import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VoteCard from '@/components/session/VoteCard';
import { CardValue } from '@/types/session';

describe('VoteCard', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders card value correctly', () => {
    render(
      <VoteCard
        value={5}
        isSelected={false}
        isDisabled={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders question mark card correctly', () => {
    render(
      <VoteCard
        value="?"
        isSelected={false}
        isDisabled={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('applies selected styles when isSelected is true', () => {
    render(
      <VoteCard
        value={3}
        isSelected={true}
        isDisabled={false}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-blue-500', 'bg-blue-100', 'text-blue-700');
  });

  it('applies default styles when isSelected is false', () => {
    render(
      <VoteCard
        value={3}
        isSelected={false}
        isDisabled={false}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-gray-300', 'bg-white', 'text-gray-700');
  });

  it('applies disabled styles when isDisabled is true', () => {
    render(
      <VoteCard
        value={8}
        isSelected={false}
        isDisabled={true}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('calls onClick with correct value when clicked', () => {
    const testValue: CardValue = 13;
    render(
      <VoteCard
        value={testValue}
        isSelected={false}
        isDisabled={false}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(testValue);
  });

  it('does not call onClick when disabled', () => {
    render(
      <VoteCard
        value={21}
        isSelected={false}
        isDisabled={true}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('has correct accessibility attributes', () => {
    render(
      <VoteCard
        value={1}
        isSelected={false}
        isDisabled={false}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });
});
