import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3>🍓 YUMFINITY</h3>
            <p>Share the warmth of your kitchen and create heartfelt memories.</p>
          </div>

          <div className={styles.section}>
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/add-recipe">Add Recipe</a></li>
              <li><a href="/login">Login</a></li>
            </ul>
          </div>

          <div className={styles.section}>
            <h4>Contact</h4>
            <ul>
              <li>Email: info@cookingapp.com</li>
              <li>Phone: +** *** ** ** </li>
              <li>Address: *****</li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; 2025 YUMFINITY. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
