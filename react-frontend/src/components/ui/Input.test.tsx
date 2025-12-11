import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('handles change events', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('handles React Native onChangeText prop', () => {
    const handleChangeText = vi.fn();
    render(<Input onChangeText={handleChangeText} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(handleChangeText).toHaveBeenCalledWith('test');
  });

  it('displays error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('displays helper text when no error', () => {
    render(<Input helperText="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(<Input label="Email" required />);
    const label = screen.getByText('Email');
    expect(label.className).toMatch(/required/);
  });

  it('applies correct variant classes', () => {
    const { container, rerender } = render(<Input variant="outlined" />);
    const wrapper = container.querySelector('[class*="inputWrapper"]');
    expect(wrapper?.className).toMatch(/outlined/);

    rerender(<Input variant="filled" />);
    expect(wrapper?.className).toMatch(/filled/);
  });

  it('supports accessibility props', () => {
    render(
      <Input 
        testID="test-input" 
        accessibilityLabel="Custom label"
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('data-testid', 'test-input');
    expect(input).toHaveAttribute('aria-label', 'Custom label');
  });

  it('associates error with input via aria-describedby', () => {
    render(<Input error="Error message" />);
    
    const input = screen.getByRole('textbox');
    const errorElement = screen.getByRole('alert');
    
    expect(input).toHaveAttribute('aria-describedby', errorElement.id);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});