/**
 * Tests for AccessibilityBadges component
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AccessibilityBadges } from './AccessibilityBadges';

describe('AccessibilityBadges', () => {
  it('renders all accessibility badges', () => {
    render(
      <AccessibilityBadges
        accessible={true}
        unisex={true}
        changingTable={true}
      />
    );

    expect(screen.getByLabelText('This restroom is wheelchair accessible')).toBeInTheDocument();
    expect(screen.getByLabelText('This is a gender-neutral restroom')).toBeInTheDocument();
    expect(screen.getByLabelText('This restroom has a baby changing table')).toBeInTheDocument();
  });

  it('shows inactive state for unavailable features', () => {
    render(
      <AccessibilityBadges
        accessible={false}
        unisex={false}
        changingTable={false}
      />
    );

    expect(screen.getByLabelText('This restroom is not wheelchair accessible')).toBeInTheDocument();
    expect(screen.getByLabelText('This is not a gender-neutral restroom')).toBeInTheDocument();
    expect(screen.getByLabelText('This restroom does not have a baby changing table')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <AccessibilityBadges
        accessible={true}
        unisex={true}
        changingTable={true}
        size="small"
      />
    );

    let container = screen.getByRole('list');
    expect(container.className).toContain('small');

    rerender(
      <AccessibilityBadges
        accessible={true}
        unisex={true}
        changingTable={true}
        size="large"
      />
    );

    container = screen.getByRole('list');
    expect(container.className).toContain('large');
  });

  it('renders with vertical layout', () => {
    render(
      <AccessibilityBadges
        accessible={true}
        unisex={true}
        changingTable={true}
        layout="vertical"
      />
    );

    const container = screen.getByRole('list');
    expect(container.className).toContain('vertical');
  });

  it('hides labels when showLabels is false', () => {
    render(
      <AccessibilityBadges
        accessible={true}
        unisex={true}
        changingTable={true}
        showLabels={false}
      />
    );

    // Labels should not be visible in the DOM when showLabels is false
    expect(screen.queryByText('Accessible')).not.toBeInTheDocument();
    expect(screen.queryByText('Unisex')).not.toBeInTheDocument();
    expect(screen.queryByText('Baby Change')).not.toBeInTheDocument();
  });

  it('shows labels when showLabels is true', () => {
    render(
      <AccessibilityBadges
        accessible={true}
        unisex={true}
        changingTable={true}
        showLabels={true}
      />
    );

    expect(screen.getByText('Accessible')).toBeInTheDocument();
    expect(screen.getByText('Unisex')).toBeInTheDocument();
    expect(screen.getByText('Baby Change')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <AccessibilityBadges
        accessible={true}
        unisex={true}
        changingTable={true}
        className="custom-class"
      />
    );

    const container = screen.getByRole('list');
    expect(container.className).toContain('custom-class');
  });
});