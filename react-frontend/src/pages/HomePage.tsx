import { SearchInterface } from '../components/search/SearchInterface';
import { SearchResults } from '../components/search/SearchResults';
import styles from './HomePage.module.css';

export function HomePage() {
  // For now, provide empty default props to SearchResults
  // This will be connected to actual search state in future tasks
  const defaultSearchProps = {
    results: [],
    loading: false,
    hasMore: false,
  };

  return (
    <div className={styles.homePage}>
      <div className={styles.hero}>
        <h1>Find Safe Restrooms</h1>
        <p>Search for accessible and safe restroom facilities in your area</p>
      </div>
      
      <div className={styles.searchSection}>
        <SearchInterface />
        <SearchResults {...defaultSearchProps} />
      </div>
    </div>
  );
}