import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../pages/App';

test('renders learn react link', () => {
  render(<App />);
  // const linkElement = screen.getByText(/Go to Login Page/i);
  // expect(linkElement).toBeInTheDocument();
});
