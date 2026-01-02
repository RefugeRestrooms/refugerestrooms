/**
 * Demo component showcasing restroom display components
 * Demonstrates RestroomCard, RestroomDetail, and navigation functionality
 */

import React, { useState } from 'react';
import { RestroomCard, RestroomDetail, RestroomContainer } from '../restroom';
import { Button } from '../ui/Button';
import type { Restroom } from '../../types/generated';
import styles from './RestroomDemo.module.css';

const mockRestrooms: Restroom[] = [
  {
    id: '1',
    name: 'Central Library Restroom',
    street: '123 Main Street',
    city: 'Downtown',
    state: 'CA',
    country: 'US',
    latitude: 37.7749,
    longitude: -122.4194,
    accessible: true,
    unisex: true,
    changingTable: true,
    comment: 'Clean and well-maintained facility with excellent accessibility features.',
    directions: 'Enter through main entrance, turn left past the information desk.',
    upvote: 25,
    downvote: 3,
    approved: true,
    overallScore: 0.89,
    safetyScore: 0.92,
    totalFeedback: 28,
    confidence: 'HIGH',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z',
    distance: 250
  },
  {
    id: '2',
    name: 'Coffee Shop Restroom',
    street: '456 Oak Avenue',
    city: 'Midtown',
    state: 'CA',
    country: 'US',
    latitude: 37.7849,
    longitude: -122.4094,
    accessible: false,
    unisex: false,
    changingTable: false,
    comment: 'Small but clean. Single occupancy.',
    upvote: 12,
    downvote: 5,
    approved: true,
    overallScore: 0.71,
    totalFeedback: 17,
    confidence: 'MEDIUM',
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2023-02-10T00:00:00Z',
    distance: 800
  },
  {
    id: '3',
    name: 'Park Visitor Center',
    street: '789 Park Drive',
    city: 'Greenville',
    state: 'CA',
    country: 'US',
    latitude: 37.7649,
    longitude: -122.4294,
    accessible: true,
    unisex: false,
    changingTable: true,
    comment: 'Family-friendly facility with baby changing station.',
    directions: 'Located in the visitor center building, accessible entrance on the right side.',
    upvote: 18,
    downvote: 2,
    approved: true,
    overallScore: 0.90,
    safetyScore: 0.88,
    totalFeedback: 20,
    confidence: 'HIGH',
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2023-03-05T00:00:00Z',
    distance: 1200
  }
];

export const RestroomDemo: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'cards' | 'detail' | 'container'>('cards');
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom>(mockRestrooms[0]);

  const handleRestroomSelect = (restroom: Restroom) => {
    setSelectedRestroom(restroom);
    setSelectedView('detail');
  };

  const handleFeedback = (restroom: Restroom) => {
    alert(`Feedback for ${restroom.name} - This would open the feedback form`);
  };

  const handleEdit = (restroom: Restroom) => {
    alert(`Edit ${restroom.name} - This would open the edit form`);
  };

  return (
    <div className={styles.demo}>
      <div className={styles.header}>
        <h1>Restroom Components Demo</h1>
        <p>Demonstration of restroom display components with navigation and error handling</p>
        
        <div className={styles.controls}>
          <Button
            variant={selectedView === 'cards' ? 'primary' : 'secondary'}
            onClick={() => setSelectedView('cards')}
          >
            Individual Cards
          </Button>
          <Button
            variant={selectedView === 'detail' ? 'primary' : 'secondary'}
            onClick={() => setSelectedView('detail')}
          >
            Detail View
          </Button>
          <Button
            variant={selectedView === 'container' ? 'primary' : 'secondary'}
            onClick={() => setSelectedView('container')}
          >
            Container Demo
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        {selectedView === 'cards' && (
          <div className={styles.cardsView}>
            <h2>Individual Restroom Cards</h2>
            <div className={styles.cardGrid}>
              {mockRestrooms.map((restroom) => (
                <RestroomCard
                  key={restroom.id}
                  restroom={restroom}
                  onSelect={handleRestroomSelect}
                  onFeedback={handleFeedback}
                  showDistance={true}
                />
              ))}
            </div>
          </div>
        )}

        {selectedView === 'detail' && (
          <div className={styles.detailView}>
            <RestroomDetail
              restroomId={selectedRestroom.id}
              onBack={() => setSelectedView('cards')}
              onEdit={handleEdit}
            />
          </div>
        )}

        {selectedView === 'container' && (
          <div className={styles.containerView}>
            <h2>Restroom Container with Navigation</h2>
            <RestroomContainer
              restrooms={mockRestrooms}
              loading={false}
              onFeedback={handleFeedback}
              onEdit={handleEdit}
            />
          </div>
        )}
      </div>

      <div className={styles.features}>
        <h2>Component Features</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <h3>RestroomCard</h3>
            <ul>
              <li>Displays key restroom information</li>
              <li>Shows accessibility badges</li>
              <li>Distance formatting</li>
              <li>Rating display with confidence</li>
              <li>Keyboard navigation support</li>
              <li>Feedback button integration</li>
            </ul>
          </div>
          
          <div className={styles.featureCard}>
            <h3>RestroomDetail</h3>
            <ul>
              <li>Full restroom information display</li>
              <li>GraphQL data loading with error handling</li>
              <li>Accessibility features section</li>
              <li>Feedback system integration</li>
              <li>Navigation with back button</li>
              <li>Google Maps directions integration</li>
            </ul>
          </div>
          
          <div className={styles.featureCard}>
            <h3>AccessibilityBadges</h3>
            <ul>
              <li>Visual accessibility indicators</li>
              <li>Multiple size variants</li>
              <li>Horizontal/vertical layouts</li>
              <li>Active/inactive states</li>
              <li>Screen reader support</li>
              <li>Responsive design</li>
            </ul>
          </div>
          
          <div className={styles.featureCard}>
            <h3>Navigation & State</h3>
            <ul>
              <li>Search to detail navigation</li>
              <li>Loading and error states</li>
              <li>Back navigation support</li>
              <li>Context preservation</li>
              <li>Mobile-responsive design</li>
              <li>Keyboard accessibility</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};