import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppIcon } from '@core/components/app-icon';

describe('AppIcon', () => {
  it('renders with correct icon', () => {
    render(<AppIcon icon="mdi:movie" />);
    const icon = screen.getByTestId('app-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('data-icon', 'mdi:movie');
  });

  it('renders with custom size', () => {
    render(<AppIcon icon="mdi:star" size={32} />);
    const icon = screen.getByTestId('app-icon');
    expect(icon).toHaveStyle({ fontSize: 32 });
  });

  it('renders with custom color', () => {
    render(<AppIcon icon="mdi:heart" color="red" />);
    const icon = screen.getByTestId('app-icon');
    expect(icon).toHaveAttribute('color', 'red');
  });

  it('passes additional props', () => {
    render(<AppIcon icon="mdi:check" className="custom-class" />);
    const icon = screen.getByTestId('app-icon');
    expect(icon).toHaveClass('custom-class');
  });
});