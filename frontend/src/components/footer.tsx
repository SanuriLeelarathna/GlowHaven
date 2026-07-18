import { Link } from "react-router-dom";
import "./footer.css";

export default function Footer() {
  return (
    <footer className="global-footer">
      <div className="footer-container">
        {/* Logo and Tagline Column */}
        <div className="footer-column footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <ellipse
                  cx="12"
                  cy="12"
                  rx="11"
                  ry="3.5"
                  transform="rotate(-25 12 12)"
                />
              </svg>
            </div>
            <span className="brand-name">GlowHaven</span>
          </div>
          <p className="footer-tagline">Enhancing Your Beauty with Care.</p>
        </div>

        {/* Quick Links Column */}
        <div className="footer-column footer-links">
          <h4>Explore</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/booking-service">Services</Link>
            </li>
            <li>
              <Link to="/booking">Booking</Link>
            </li>
            <li>
              <a href="/#about">About</a>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Contact Details Column */}
        <div className="footer-column footer-contact">
          <h4>Contact Us</h4>
          <p>📍 Colombo, Sri Lanka</p>
          <p>☎ +94 767052004</p>
          <p>✉ glowhaven0009@gmail.com</p>
        </div>

        {/* Social Media Column */}
        <div className="footer-column footer-social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a10 10 0 0 1 8 16l-8-6-8 6a10 10 0 0 1 8-16z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Row */}
      <div className="footer-bottom">
        <p>© 2026 GlowHaven. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
