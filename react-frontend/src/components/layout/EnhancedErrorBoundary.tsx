import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { RetryButton } from '../ui/RetryButton';
import { Icon } from '../ui/Icon';
import styles from './EnhancedErrorBoundary.module.css';

interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRetryButton?: boolean;
  maxRetries?: number;
  level?: 'page' | 'component' | 'critical';
}

interface EnhancedErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  errorId: string;
}

export class EnhancedErrorBoundary extends Component<
  EnhancedErrorBoundaryProps,
  EnhancedErrorBoundaryState
> {
  private retryTimeoutId: number | null = null;

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<EnhancedErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('EnhancedErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you might want to log to an error reporting service
    // Example: logErrorToService(error, errorInfo, this.state.errorId);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = async () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      return;
    }

    // Clear the error state to trigger a re-render
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: retryCount + 1,
    });

    // If the error occurs again immediately, it will be caught by componentDidCatch
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  getErrorSeverity = (): 'low' | 'medium' | 'high' => {
    const { level = 'component' } = this.props;
    const { error } = this.state;

    if (level === 'critical') return 'high';
    if (level === 'page') return 'medium';

    // Check error type for severity
    if (error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk')) {
      return 'medium'; // Code splitting errors
    }

    if (error?.name === 'TypeError' && error?.message?.includes('Cannot read prop')) {
      return 'low'; // Property access errors
    }

    return 'medium';
  };

  getErrorMessage = (): string => {
    const { error } = this.state;
    const severity = this.getErrorSeverity();

    if (error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk')) {
      return 'Failed to load application resources. This might be due to a network issue or an app update.';
    }

    if (severity === 'high') {
      return 'A critical error occurred that prevents the application from working properly.';
    }

    if (severity === 'medium') {
      return 'Something went wrong with this part of the application.';
    }

    return 'A minor error occurred, but you should be able to continue using the app.';
  };

  getRecoveryActions = () => {
    const { showRetryButton = true, maxRetries = 3 } = this.props;
    const { retryCount, error } = this.state;
    const severity = this.getErrorSeverity();

    const actions = [];

    // Show retry button for most errors
    if (showRetryButton && retryCount < maxRetries) {
      actions.push({
        key: 'retry',
        label: 'Try Again',
        action: this.handleRetry,
        primary: true,
      });
    }

    // Show reload for chunk load errors or high severity
    if (error?.name === 'ChunkLoadError' || severity === 'high') {
      actions.push({
        key: 'reload',
        label: 'Reload Page',
        action: this.handleReload,
        primary: !showRetryButton || retryCount >= maxRetries,
      });
    }

    // Always show go home option
    actions.push({
      key: 'home',
      label: 'Go Home',
      action: this.handleGoHome,
      primary: false,
    });

    return actions;
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, retryCount, errorId } = this.state;
      const { maxRetries = 3 } = this.props;
      const severity = this.getErrorSeverity();
      const errorMessage = this.getErrorMessage();
      const recoveryActions = this.getRecoveryActions();

      const containerClasses = [
        styles.errorBoundary,
        styles[severity],
      ].join(' ');

      return (
        <div className={containerClasses}>
          <div className={styles.errorContent}>
            <div className={styles.errorHeader}>
              <Icon 
                name={severity === 'high' ? 'error' : 'warning'} 
                size="large" 
                className={styles.errorIcon}
              />
              <h2 className={styles.errorTitle}>
                {severity === 'high' ? 'Critical Error' : 'Something went wrong'}
              </h2>
            </div>

            <p className={styles.errorMessage}>{errorMessage}</p>

            {retryCount > 0 && (
              <div className={styles.retryInfo}>
                <Icon name="info" size="small" />
                <span>
                  Retry attempt {retryCount} of {maxRetries}
                </span>
              </div>
            )}

            {import.meta.env.DEV && error && (
              <details className={styles.errorDetails}>
                <summary>Error Details (Development)</summary>
                <div className={styles.errorStack}>
                  <div className={styles.errorId}>
                    <strong>Error ID:</strong> {errorId}
                  </div>
                  <div className={styles.errorName}>
                    <strong>Error:</strong> {error.name}
                  </div>
                  <div className={styles.errorMessageDetail}>
                    <strong>Message:</strong> {error.message}
                  </div>
                  <pre className={styles.stackTrace}>
                    {error.stack}
                    {errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}

            <div className={styles.errorActions}>
              {recoveryActions.map((action) => (
                action.key === 'retry' ? (
                  <RetryButton
                    key={action.key}
                    onRetry={action.action}
                    maxRetries={maxRetries}
                    variant={action.primary ? 'primary' : 'secondary'}
                    className={styles.actionButton}
                  >
                    {action.label}
                  </RetryButton>
                ) : (
                  <button
                    key={action.key}
                    onClick={action.action}
                    className={`${styles.actionButton} ${
                      action.primary ? styles.primary : styles.secondary
                    }`}
                  >
                    {action.label}
                  </button>
                )
              ))}
            </div>

            {severity === 'high' && (
              <div className={styles.supportInfo}>
                <Icon name="help" size="small" />
                <span>
                  If this problem persists, please contact support with Error ID: {errorId}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}