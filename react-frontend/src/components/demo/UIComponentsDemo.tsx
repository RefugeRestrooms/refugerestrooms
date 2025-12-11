import React, { useState } from 'react';
import { Button, Input, Modal, Icon, ToastContainer } from '../ui';
import { useToast } from '../../hooks/useToast';
import styles from './UIComponentsDemo.module.css';

export const UIComponentsDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { toasts, showToast } = useToast();

  const handleShowToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    showToast({
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      message: `This is a ${type} toast notification message.`,
      duration: 5000
    });
  };

  return (
    <div className={styles.demo}>
      <h1>UI Components Demo</h1>
      
      <section className={styles.section}>
        <h2>Buttons</h2>
        <div className={styles.buttonGrid}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="small">Small</Button>
          <Button size="large">Large</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Icons</h2>
        <div className={styles.iconGrid}>
          <Icon name="search" />
          <Icon name="location" />
          <Icon name="filter" />
          <Icon name="accessibility" />
          <Icon name="wheelchair" />
          <Icon name="baby" />
          <Icon name="unisex" />
          <Icon name="heart" />
          <Icon name="star" />
          <Icon name="user" />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Inputs</h2>
        <div className={styles.inputGrid}>
          <Input 
            label="Email" 
            placeholder="Enter your email"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Input 
            label="Password" 
            type="password"
            required
            helperText="Must be at least 8 characters"
          />
          <Input 
            label="Search" 
            leftIcon={<Icon name="search" size="small" />}
            placeholder="Search restrooms..."
          />
          <Input 
            label="Error Example" 
            error="This field is required"
            variant="outlined"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Modal & Toasts</h2>
        <div className={styles.buttonGrid}>
          <Button onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>
          <Button onClick={() => handleShowToast('success')}>
            Success Toast
          </Button>
          <Button onClick={() => handleShowToast('error')}>
            Error Toast
          </Button>
          <Button onClick={() => handleShowToast('warning')}>
            Warning Toast
          </Button>
          <Button onClick={() => handleShowToast('info')}>
            Info Toast
          </Button>
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Demo Modal"
        size="medium"
      >
        <p>This is a demo modal with React Native compatible props.</p>
        <p>It includes focus management, keyboard navigation, and accessibility features.</p>
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsModalOpen(false)}>
            Confirm
          </Button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} position="top-right" />
    </div>
  );
};