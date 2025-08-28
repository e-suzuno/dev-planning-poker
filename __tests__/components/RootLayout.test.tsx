import React from 'react'
import { render } from '@testing-library/react'
import RootLayout from '@/app/layout'

describe('RootLayout', () => {
  it('renders children correctly', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    )
    
    expect(getByTestId('test-child')).toBeInTheDocument()
    expect(getByTestId('test-child')).toHaveTextContent('Test Content')
  })
})
