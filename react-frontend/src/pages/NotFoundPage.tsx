import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <div className={styles.notFoundPage}>
      <div className={styles.content}>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        
        <div className={styles.actions}>
          <Link to="/" className={styles.homeButton}>
            Go Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className={styles.backButton}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}