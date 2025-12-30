/**
 * RestroomForm component for creating new restroom entries
 * Implements comprehensive form validation with real-time feedback
 * Includes address input with geocoding integration
 */

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Icon } from '../ui/Icon';
import { LocationInput } from '../search/LocationInput';
import { useGeocoding } from '../../hooks/useGeocoding';
import type { LocationCoordinates } from '../../services/location';
import { CREATE_RESTROOM } from '../../types/generated';
import type { CreateRestroomInput, Restroom } from '../../types/generated';
import styles from './RestroomForm.module.css';

export interface RestroomFormProps {
  onSuccess?: (restroom: Restroom) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  className?: string;
}

interface FormData {
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  accessible: boolean;
  unisex: boolean;
  changingTable: boolean;
  comment: string;
  directions: string;
}

interface FormErrors {
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  comment?: string;
  directions?: string;
  general?: string;
}

const initialFormData: FormData = {
  name: '',
  street: '',
  city: '',
  state: '',
  country: '',
  accessible: false,
  unisex: false,
  changingTable: false,
  comment: '',
  directions: ''
};

export const RestroomForm: React.FC<RestroomFormProps> = ({
  onSuccess,
  onError,
  onCancel,
  className = ''
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const geocoding = useGeocoding();
  const [createRestroom] = useMutation<{ createRestroom: Restroom }, { input: CreateRestroomInput }>(CREATE_RESTROOM);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = Object.values(formData).some(value => 
      typeof value === 'string' ? value.trim() !== '' : value === true
    ) || addressInput.trim() !== '';
    setHasUnsavedChanges(hasChanges);
  }, [formData, addressInput]);

  // Persist form data to localStorage
  useEffect(() => {
    if (hasUnsavedChanges) {
      const dataToSave = {
        formData,
        coordinates,
        addressInput,
        timestamp: Date.now()
      };
      localStorage.setItem('restroom-form-draft', JSON.stringify(dataToSave));
    }
  }, [formData, coordinates, addressInput, hasUnsavedChanges]);

  // Restore form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('restroom-form-draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Only restore if saved within last 24 hours
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setFormData(parsed.formData || initialFormData);
          setCoordinates(parsed.coordinates || null);
          setAddressInput(parsed.addressInput || '');
        }
      } catch (error) {
        console.warn('Failed to restore form data:', error);
      }
    }
  }, []);

  const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
    switch (name) {
      case 'name':
        if (typeof value === 'string') {
          if (!value.trim()) return 'Restroom name is required';
          if (value.trim().length < 2) return 'Name must be at least 2 characters';
          if (value.trim().length > 100) return 'Name must be less than 100 characters';
        }
        break;
      case 'street':
        if (typeof value === 'string') {
          if (!value.trim()) return 'Street address is required';
          if (value.trim().length < 5) return 'Please enter a complete street address';
        }
        break;
      case 'city':
        if (typeof value === 'string') {
          if (!value.trim()) return 'City is required';
          if (value.trim().length < 2) return 'City must be at least 2 characters';
        }
        break;
      case 'state':
        if (typeof value === 'string') {
          if (!value.trim()) return 'State/Province is required';
          if (value.trim().length < 2) return 'State/Province must be at least 2 characters';
        }
        break;
      case 'country':
        if (typeof value === 'string') {
          if (!value.trim()) return 'Country is required';
          if (value.trim().length < 2) return 'Country must be at least 2 characters';
        }
        break;
      case 'comment':
        if (typeof value === 'string' && value.trim().length > 500) {
          return 'Comment must be less than 500 characters';
        }
        break;
      case 'directions':
        if (typeof value === 'string' && value.trim().length > 500) {
          return 'Directions must be less than 500 characters';
        }
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate required fields
    Object.entries(formData).forEach(([key, value]) => {
      if (['name', 'street', 'city', 'state', 'country'].includes(key)) {
        const error = validateField(key as keyof FormData, value);
        if (error) {
          newErrors[key as keyof FormErrors] = error;
        }
      }
    });

    // Validate address/coordinates
    if (!coordinates && !addressInput.trim()) {
      newErrors.address = 'Please provide a location for the restroom';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;

    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error on change
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Real-time validation for text fields
    if (typeof value === 'string') {
      const error = validateField(field, value);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
      }
    }
  };

  const handleLocationSelect = async (location: LocationCoordinates, address?: string) => {
    setCoordinates(location);
    
    if (address) {
      setAddressInput(address);
      // Try to parse address components
      const result = await geocoding.reverseGeocode(location);
      if (result) {
        const components = geocoding.parseAddressComponents(result.formattedAddress);
        if (components) {
          setFormData(prev => ({
            ...prev,
            street: components.street || prev.street,
            city: components.city || prev.city,
            state: components.state || prev.state,
            country: components.country || prev.country
          }));
        }
      }
    }

    // Clear address error
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: undefined }));
    }
  };

  const handleLocationError = (error: string) => {
    setErrors(prev => ({ ...prev, address: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // If we have coordinates but no address components, try to geocode
      if (coordinates && (!formData.street || !formData.city)) {
        const result = await geocoding.reverseGeocode(coordinates);
        if (result) {
          const components = geocoding.parseAddressComponents(result.formattedAddress);
          if (components) {
            setFormData(prev => ({
              ...prev,
              street: components.street || prev.street,
              city: components.city || prev.city,
              state: components.state || prev.state,
              country: components.country || prev.country
            }));
          }
        }
      }

      const input: CreateRestroomInput = {
        name: formData.name.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        accessible: formData.accessible,
        unisex: formData.unisex,
        changingTable: formData.changingTable,
        comment: formData.comment.trim() || undefined,
        directions: formData.directions.trim() || undefined
      };

      const { data } = await createRestroom({
        variables: { input }
      });

      if (data?.createRestroom) {
        // Clear saved draft
        localStorage.removeItem('restroom-form-draft');
        setHasUnsavedChanges(false);
        
        if (onSuccess) {
          onSuccess(data.createRestroom);
        }
        
        // Reset form
        setFormData(initialFormData);
        setCoordinates(null);
        setAddressInput('');
      }
    } catch (error: any) {
      console.error('Failed to create restroom:', error);
      
      let errorMessage = 'Failed to create restroom. Please try again.';
      
      if (error.networkError) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.graphQLErrors?.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      }
      
      setErrors({ general: errorMessage });
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmed) return;
    }
    
    // Clear saved draft
    localStorage.removeItem('restroom-form-draft');
    setHasUnsavedChanges(false);
    
    if (onCancel) {
      onCancel();
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('restroom-form-draft');
    setFormData(initialFormData);
    setCoordinates(null);
    setAddressInput('');
    setErrors({});
    setHasUnsavedChanges(false);
  };

  return (
    <form onSubmit={handleSubmit} className={`${styles.restroomForm} ${className}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Add New Restroom</h2>
        <p className={styles.subtitle}>
          Help others find safe and accessible restrooms by adding a new location
        </p>
      </div>

      {errors.general && (
        <div className={styles.errorAlert} role="alert">
          <Icon name="error" className={styles.errorIcon} />
          {errors.general}
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Basic Information</h3>
        
        <Input
          label="Restroom Name"
          value={formData.name}
          onChange={handleInputChange('name')}
          error={errors.name}
          placeholder="e.g., Starbucks, City Hall, Main Library"
          required
          disabled={isSubmitting}
          className={styles.input}
        />

        <div className={styles.checkboxGroup}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={formData.accessible}
              onChange={handleInputChange('accessible')}
              disabled={isSubmitting}
            />
            <span className={styles.checkboxLabel}>
              <Icon name="wheelchair" className={styles.checkboxIcon} />
              Wheelchair Accessible
            </span>
          </label>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={formData.unisex}
              onChange={handleInputChange('unisex')}
              disabled={isSubmitting}
            />
            <span className={styles.checkboxLabel}>
              <Icon name="unisex" className={styles.checkboxIcon} />
              Gender Neutral/Unisex
            </span>
          </label>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={formData.changingTable}
              onChange={handleInputChange('changingTable')}
              disabled={isSubmitting}
            />
            <span className={styles.checkboxLabel}>
              <Icon name="baby" className={styles.checkboxIcon} />
              Changing Table Available
            </span>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Location</h3>
        
        <LocationInput
          value={addressInput}
          placeholder="Enter address or use current location"
          onLocationSelect={handleLocationSelect}
          onError={handleLocationError}
          disabled={isSubmitting}
          className={styles.locationInput}
        />
        
        {errors.address && (
          <div className={styles.fieldError} role="alert">
            {errors.address}
          </div>
        )}

        <div className={styles.addressFields}>
          <Input
            label="Street Address"
            value={formData.street}
            onChange={handleInputChange('street')}
            error={errors.street}
            placeholder="123 Main Street"
            required
            disabled={isSubmitting}
            className={styles.input}
          />

          <div className={styles.row}>
            <Input
              label="City"
              value={formData.city}
              onChange={handleInputChange('city')}
              error={errors.city}
              placeholder="San Francisco"
              required
              disabled={isSubmitting}
              className={styles.input}
            />

            <Input
              label="State/Province"
              value={formData.state}
              onChange={handleInputChange('state')}
              error={errors.state}
              placeholder="CA"
              required
              disabled={isSubmitting}
              className={styles.input}
            />
          </div>

          <Input
            label="Country"
            value={formData.country}
            onChange={handleInputChange('country')}
            error={errors.country}
            placeholder="United States"
            required
            disabled={isSubmitting}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Additional Information</h3>
        
        <div className={styles.textareaField}>
          <label htmlFor="comment" className={styles.textareaLabel}>
            Comments
          </label>
          <textarea
            id="comment"
            value={formData.comment}
            onChange={handleInputChange('comment')}
            placeholder="Any additional information about this restroom (optional)"
            disabled={isSubmitting}
            className={styles.textarea}
            rows={3}
            maxLength={500}
          />
          {errors.comment && (
            <div className={styles.fieldError} role="alert">
              {errors.comment}
            </div>
          )}
          <div className={styles.characterCount}>
            {formData.comment.length}/500
          </div>
        </div>

        <div className={styles.textareaField}>
          <label htmlFor="directions" className={styles.textareaLabel}>
            Directions
          </label>
          <textarea
            id="directions"
            value={formData.directions}
            onChange={handleInputChange('directions')}
            placeholder="How to find this restroom (optional)"
            disabled={isSubmitting}
            className={styles.textarea}
            rows={3}
            maxLength={500}
          />
          {errors.directions && (
            <div className={styles.fieldError} role="alert">
              {errors.directions}
            </div>
          )}
          <div className={styles.characterCount}>
            {formData.directions.length}/500
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        {hasUnsavedChanges && (
          <button
            type="button"
            onClick={clearDraft}
            className={styles.clearDraftButton}
            disabled={isSubmitting}
          >
            Clear Draft
          </button>
        )}
        
        <div className={styles.primaryActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding Restroom...' : 'Add Restroom'}
          </Button>
        </div>
      </div>
    </form>
  );
};