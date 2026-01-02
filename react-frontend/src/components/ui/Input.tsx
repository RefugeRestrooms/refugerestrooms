import React, { forwardRef, useState, useId } from 'react';
import styles from './Input.module.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled';
  fullWidth?: boolean;
  required?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onChangeText?: (text: string) => void; // React Native compatibility
  testID?: string; // React Native compatibility
  accessibilityLabel?: string; // React Native compatibility
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  size = 'medium',
  variant = 'outlined',
  fullWidth = false,
  required = false,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  id,
  onChange,
  onChangeText,
  testID,
  accessibilityLabel,
  disabled,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperTextId = helperText ? `${inputId}-helper` : undefined;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event);
    }
    if (onChangeText) {
      onChangeText(event.target.value);
    }
  };

  const containerClasses = [
    styles.container,
    fullWidth && styles.fullWidth,
    className
  ].filter(Boolean).join(' ');

  const inputWrapperClasses = [
    styles.inputWrapper,
    styles[variant],
    styles[size],
    focused && styles.focused,
    error && styles.error,
    disabled && styles.disabled,
    loading && styles.loading,
    leftIcon && styles.hasLeftIcon,
    rightIcon && styles.hasRightIcon
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label 
          htmlFor={inputId} 
          className={`${styles.label} ${required ? styles.required : ''}`}
        >
          {label}
        </label>
      )}
      
      <div className={inputWrapperClasses}>
        {leftIcon && (
          <div className={styles.leftIcon} aria-hidden="true">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={styles.input}
          disabled={disabled || loading}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[errorId, helperTextId].filter(Boolean).join(' ') || undefined}
          aria-label={accessibilityLabel}
          data-testid={testID}
          {...props}
        />
        
        {rightIcon && (
          <div className={styles.rightIcon} aria-hidden="true">
            {rightIcon}
          </div>
        )}
        
        {loading && (
          <div className={styles.loadingSpinner} aria-hidden="true">
            <span className={styles.spinner} />
          </div>
        )}
      </div>
      
      {error && (
        <div id={errorId} className={styles.errorText} role="alert">
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <div id={helperTextId} className={styles.helperText}>
          {helperText}
        </div>
      )}
    </div>
  );
});