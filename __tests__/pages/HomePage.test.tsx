import React from 'react'
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />)
    const heading = screen.getByRole('heading', { name: /planning poker/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders session creation section', () => {
    render(<HomePage />)
    const createButton = screen.getByRole('button', { name: /セッション作成/i })
    expect(createButton).toBeInTheDocument()
  })

  it('renders session join section', () => {
    render(<HomePage />)
    const joinButton = screen.getByRole('button', { name: /参加/i })
    const sessionInput = screen.getByPlaceholderText(/セッションIDを入力/i)
    expect(joinButton).toBeInTheDocument()
    expect(sessionInput).toBeInTheDocument()
  })
})
