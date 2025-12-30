import { RestroomForm } from '../components/forms/RestroomForm';
import styles from './SubmitPage.module.css';

export function SubmitPage() {
  return (
    <div className={styles.submitPage}>
      <div className={styles.header}>
        <h1>Add a Restroom</h1>
        <p>Help others by adding information about safe and accessible restrooms</p>
      </div>
      
      <div className={styles.formSection}>
        <RestroomForm />
      </div>
    </div>
  );
}