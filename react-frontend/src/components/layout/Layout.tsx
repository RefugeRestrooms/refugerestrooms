import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActiveRoute = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <h1>REFUGE Restrooms</h1>
            <p>Safe restroom access for everyone</p>
          </Link>
          
          <nav className={styles.navigation}>
            <Link 
              to="/" 
              className={`${styles.navLink} ${isActiveRoute('/') ? styles.active : ''}`}
            >
              Search
            </Link>
            <Link 
              to="/submit" 
              className={`${styles.navLink} ${isActiveRoute('/submit') ? styles.active : ''}`}
            >
              Add Restroom
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; 2024 REFUGE Restrooms. A community-driven resource for safe restroom access.</p>
          <div className={styles.footerLinks}>
            <a href="https://github.com/RefugeRestrooms/refugerestrooms" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <span className={styles.separator}>|</span>
            <Link to="/about">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}