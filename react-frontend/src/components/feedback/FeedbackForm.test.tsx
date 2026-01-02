import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackForm } from './FeedbackForm';

// Mock Apollo Client
const mockMutate = vi.fn();
let mockLoading = false;
let mockOnCompleted: (() => void) | undefined;
let mockOnError: ((error: Error) => void) | undefined;

vi.mock('@apollo/client/react', () => ({
  useMutation: (_mutation: unknown, options?: { onCompleted?: () => void; onError?: (error: Error) => void }) => {
    mockOnCompleted = options?.onCompleted;
    mockOnError = options?.onError;
    
    const mutateFunction = async (mutationOptions: unknown) => {
      try {
        const result = await mockMutate(mutationOptions);
        if (mockOnCompleted) {
          mockOnCompleted();
        }
        return result;
      } catch (error) {
        if (mockOnError) {
          mockOnError(error as Error);
        }
        throw error;
      }
    };
    
    return [mutateFunction, { loading: mockLoading }];
  }
}));

vi.mock('@apollo/client', () => ({
  gql: (strings: TemplateStringsArray) => strings[0]
}));

// Mock CSS modules
vi.mock('./FeedbackForm.module.css', () => ({
  default: {}
}));

vi.mock('../ui/Icon.module.css', () => ({
  default: {}
}));

vi.mock('../ui/Button.module.css', () => ({
  default: {}
}));

// Mock UI components
vi.mock('../ui/Button', () => ({
  Button: ({ children, onClick, disabled, loading, type = 'button', ...props }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    disabled?: boolean; 
    loading?: boolean; 
    type?: 'button' | 'submit' | 'reset';
    [key: string]: unknown;
  }) => (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}));

vi.mock('../ui/Icon', () => ({
  Icon: ({ name, className }: { name: string; className?: string }) => (
    <span className={className} data-testid={`icon-${name}`}>
      {name}
    </span>
  )
}));

const mockRestroom = {
  id: '1',
  name: 'Test Restroom',
  street: '123 Main St',
  city: 'Test City',
  state: 'TS',
  country: 'US',
  latitude: 40.7128,
  longitude: -74.0060,
  accessible: true,
  unisex: false,
  changingTable: true,
  comment: 'Test comment',
  directions: 'Test directions',
  upvote: 8,
  downvote: 2,
  approved: true,
  overallScore: 0.8,
  safetyScore: 0.85,
  totalFeedback: 10,
  confidence: 'HIGH' as const,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

describe('FeedbackForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = false;
    mockOnCompleted = undefined;
    mockOnError = undefined;
    mockMutate.mockResolvedValue({ data: { submitFeedback: mockRestroom } });
  });

  const renderFeedbackForm = () => {
    return render(
      <FeedbackForm
        restroom={mockRestroom}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
  };

  it('displays restroom information', () => {
    renderFeedbackForm();

    expect(screen.getByText('Test Restroom')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, Test City, TS')).toBeInTheDocument();
  });

  it('shows positive rating selected by default', () => {
    renderFeedbackForm();

    const positiveButton = screen.getByRole('button', { name: /positive/i });
    const negativeButton = screen.getByRole('button', { name: /negative/i });

    expect(positiveButton).toHaveAttribute('aria-pressed', 'true');
    expect(negativeButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches between positive and negative ratings', async () => {
    const user = userEvent.setup();
    renderFeedbackForm();

    const negativeButton = screen.getByRole('button', { name: /negative/i });
    await user.click(negativeButton);

    expect(negativeButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /positive/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows appropriate reasons for positive rating', () => {
    renderFeedbackForm();

    expect(screen.getByText('Safe')).toBeInTheDocument();
    expect(screen.getByText('Clean')).toBeInTheDocument();
    expect(screen.getByText('Accessible')).toBeInTheDocument();
    expect(screen.getByText('Accurate Info')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('shows appropriate reasons for negative rating', async () => {
    const user = userEvent.setup();
    renderFeedbackForm();

    const negativeButton = screen.getByRole('button', { name: /negative/i });
    await user.click(negativeButton);

    expect(screen.getByText('Unsafe')).toBeInTheDocument();
    expect(screen.getByText('Dirty')).toBeInTheDocument();
    expect(screen.getByText('Inaccessible')).toBeInTheDocument();
    expect(screen.getByText('Outdated Info')).toBeInTheDocument();
    expect(screen.getByText('Inappropriate')).toBeInTheDocument();
  });

  it('allows selecting multiple reasons', async () => {
    const user = userEvent.setup();
    renderFeedbackForm();

    const safeCheckbox = screen.getByRole('checkbox', { name: /safe/i });
    const cleanCheckbox = screen.getByRole('checkbox', { name: /clean/i });

    await user.click(safeCheckbox);
    await user.click(cleanCheckbox);

    expect(safeCheckbox).toBeChecked();
    expect(cleanCheckbox).toBeChecked();
  });

  it('validates that at least one reason is selected', async () => {
    const user = userEvent.setup();
    renderFeedbackForm();

    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    await user.click(submitButton);

    expect(screen.getByText('Please select at least one reason for your rating')).toBeInTheDocument();
  });

  it('validates comment length', async () => {
    const user = userEvent.setup();
    renderFeedbackForm();

    // Select a reason first to avoid the reason validation error
    const safeCheckbox = screen.getByRole('checkbox', { name: /safe/i });
    await user.click(safeCheckbox);

    const commentTextarea = screen.getByRole('textbox', { name: /additional comments/i });
    
    // Remove maxLength temporarily to allow typing more than 500 characters
    commentTextarea.removeAttribute('maxlength');
    
    const longComment = 'a'.repeat(501);
    await user.clear(commentTextarea);
    await user.type(commentTextarea, longComment);

    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    await user.click(submitButton);

    expect(screen.getByText('Comment must be 500 characters or less')).toBeInTheDocument();
  });

  it('shows character count for comment', async () => {
    const user = userEvent.setup();
    renderFeedbackForm();

    const commentTextarea = screen.getByRole('textbox', { name: /additional comments/i });
    await user.type(commentTextarea, 'Test comment');

    expect(screen.getByText('12/500 characters')).toBeInTheDocument();
  });

  it('submits feedback successfully', async () => {
    const user = userEvent.setup();
    renderFeedbackForm();

    // Select reasons
    const safeCheckbox = screen.getByRole('checkbox', { name: /safe/i });
    const cleanCheckbox = screen.getByRole('checkbox', { name: /clean/i });
    await user.click(safeCheckbox);
    await user.click(cleanCheckbox);

    // Add comment
    const commentTextarea = screen.getByRole('textbox', { name: /additional comments/i });
    await user.type(commentTextarea, 'Great restroom!');

    // Submit
    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        variables: {
          restroomId: '1',
          positive: true,
          reasons: ['SAFE', 'CLEAN'],
          comment: 'Great restroom!'
        }
      });
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('handles submission errors', async () => {
    const user = userEvent.setup();
    mockMutate.mockRejectedValue(new Error('Network error'));
    renderFeedbackForm();

    // Switch to negative rating
    const negativeButton = screen.getByRole('button', { name: /negative/i });
    await user.click(negativeButton);

    // Select reason
    const unsafeCheckbox = screen.getByRole('checkbox', { name: /unsafe/i });
    await user.click(unsafeCheckbox);

    // Submit
    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderFeedbackForm();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables form during submission', async () => {
    mockLoading = true;
    renderFeedbackForm();

    const submitButton = screen.getByRole('button', { name: /loading/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    // Check that buttons are disabled during submission
    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('clears reasons when switching rating type', async () => {
    const user = userEvent.setup();
    renderFeedbackForm();

    // Select positive reasons
    const safeCheckbox = screen.getByRole('checkbox', { name: /safe/i });
    await user.click(safeCheckbox);
    expect(safeCheckbox).toBeChecked();

    // Switch to negative
    const negativeButton = screen.getByRole('button', { name: /negative/i });
    await user.click(negativeButton);

    // Check that no negative reasons are selected
    const unsafeCheckbox = screen.getByRole('checkbox', { name: /unsafe/i });
    expect(unsafeCheckbox).not.toBeChecked();
  });
});