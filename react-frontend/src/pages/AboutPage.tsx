import styles from './AboutPage.module.css';

export function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      <div className={styles.header}>
        <h1>About REFUGE Restrooms</h1>
      </div>
      
      <div className={styles.content}>
        <section className={styles.section}>
          <h2>Our Mission</h2>
          <p>
            REFUGE Restrooms is a community-driven resource for finding safe restroom access 
            for transgender, intersex, and gender nonconforming individuals. We provide a 
            searchable database of gender-neutral and accessible restrooms to help ensure 
            everyone has access to safe facilities.
          </p>
        </section>

        <section className={styles.section}>
          <h2>How It Works</h2>
          <p>
            Our platform allows users to search for restrooms based on location and 
            accessibility features. Community members can contribute by adding new restroom 
            locations and providing feedback on existing facilities. All submissions are 
            reviewed to maintain accuracy and safety.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Community Driven</h2>
          <p>
            This project is built by and for the community. We rely on contributions from 
            users like you to keep our database current and comprehensive. Whether you're 
            adding a new location or updating existing information, every contribution helps 
            make restroom access safer for everyone.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Get Involved</h2>
          <p>
            Want to help improve REFUGE Restrooms? You can contribute by:
          </p>
          <ul>
            <li>Adding new restroom locations</li>
            <li>Updating existing restroom information</li>
            <li>Providing feedback on restroom accessibility</li>
            <li>Contributing to our open-source codebase on GitHub</li>
          </ul>
        </section>
      </div>
    </div>
  );
}