import Heroimg from "../assets/about.jpg";
import "./hero.css";

export default function Hero() {
  return (
    <section className="hero-section" id="home">

      <div className="hero-container">

        {/* LEFT CONTENT */}
        <div className="hero-content">

          <h1 className="hero-title">
            WELCOME
            <span> to </span>
            <br />
            GlowHaven
          </h1>


          <p className="hero-description">
            Welcome to Glow Haven, a premier boutique studio
            dedicated to providing you with an exceptional
            beauty experience.
          </p>


          <p className="hero-sub-description">
            Bespoke care is our signature. Our stylists design
            treatments that enhance your natural radiance.
          </p>


          <a href="#services" className="hero-button">
            View Services
          </a>


        </div>



        {/* RIGHT IMAGE */}

        <div className="hero-image-wrapper">

          <div className="image-frame">

            <img
              src={Heroimg}
              alt="Glow Haven Salon"
            />

          </div>

        </div>


      </div>


    </section>
  );
}