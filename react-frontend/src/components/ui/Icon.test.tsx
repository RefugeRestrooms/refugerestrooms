import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Icon } from './Icon';

// Mock console.warn to test invalid icon names
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('Icon Component', () => {
  afterEach(() => {
    mockConsoleWarn.mockClear();
  });

  it('renders valid icon', () => {
    render(<Icon name="search" />);
    const icon = screen.getByRole('img');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-label', 'search icon');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Icon name="search" size="small" />);
    const icon = screen.getByRole('img');
    expect(icon.className).toMatch(/small/);

    rerender(<Icon name="search" size="large" />);
    expect(icon.className).toMatch(/large/);
  });

  it('applies numeric size as inline style', () => {
    render(<Icon name="search" size={48} />);
    const icon = screen.getByRole('img');
    expect(icon).toHaveStyle({ width: '48px', height: '48px' });
  });

  it('applies custom color', () => {
    render(<Icon name="search" color="red" />);
    expect(screen.getByRole('img')).toHaveStyle({ color: 'red' });
  });

  it('supports accessibility props', () => {
    render(
      <Icon 
        name="search" 
        testID="test-icon" 
        accessibilityLabel="Custom search icon"
      />
    );
    
    const icon = screen.getByRole('img');
    expect(icon).toHaveAttribute('data-testid', 'test-icon');
    expect(icon).toHaveAttribute('aria-label', 'Custom search icon');
  });

  it('warns and returns null for invalid icon name', () => {
    // @ts-expect-error - Testing invalid icon name
    const { container } = render(<Icon name="invalid-icon" />);
    
    expect(mockConsoleWarn).toHaveBeenCalledWith('Icon "invalid-icon" not found');
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    render(<Icon name="search" className="custom-class" />);
    expect(screen.getByRole('img')).toHaveClass('custom-class');
  });
});