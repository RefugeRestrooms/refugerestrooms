import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles React Native onPress prop', () => {
    const handlePress = vi.fn();
    render(<Button onPress={handlePress}>Press me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('disables button when loading', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/primary/);

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(button.className).toMatch(/secondary/);
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/small/);

    rerender(<Button size="large">Large</Button>);
    expect(button.className).toMatch(/large/);
  });

  it('supports accessibility props', () => {
    render(
      <Button 
        testID="test-button" 
        accessibilityLabel="Custom label"
      >
        Button
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-testid', 'test-button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
  });
});