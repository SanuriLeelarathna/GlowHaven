import Heroimg from "../assets/ok.png";
import "./hero.css";

export default function Hero() {
  return (
    <section className="hero-section" id="home">
      <div className="hero-container">
        {/* LEFT CONTENT */}
        <div className="hero-content">
          <span className="hero-label">GlowHaven Salon</span>
          <h1 className="hero-title">
            WELCOME
            <span> to </span>
            <br />
            GlowHaven
          </h1>



          <div className="hero-actions">
            <a href="#services" className="hero-button">
              View Services
            </a>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="hero-image-wrapper">
          <img
            src={Heroimg}
            alt="Glow Haven Salon"
            className="hero-image"
          />
        </div>
      </div>
    </section>
  );
}