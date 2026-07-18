import aboutHair from "../assets/ab.jpg";
import teamPortrait from "../assets/team_portrait.png";
import "./about.css";
import bgImage from "../assets/hrr.png";

export default function About() {
  return (
    <section className="about-section" id="about">

      {/* Background Shapes */}
      <div
        className="bg-left"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      >

      </div>
      <div className="bg-bottom"></div>

      {/* ================= TOP ================= */}

      <div className="about-top">

        <div className="top-left">

          <span className="small-title">
            A PLACE WHERE
          </span>

          <h1>
            BEAUTY
            <br />
            & LUXURY
            <span className="meet">
              meet
            </span>
          </h1>

        </div>

        <div className="top-right">

          <p>
            At Glow Haven, we believe beauty is more than skin deep.
            It reflects confidence, elegance and self-love.
          </p>

          <p>
            Experience luxury beauty treatments tailored especially
            for you in a peaceful atmosphere designed for comfort
            and relaxation.
          </p>

        </div>

      </div>

      {/* ================= BIG TITLE ================= */}

      <div className="title-wrapper">

        <h2>
          OUR EXPERTISE
        </h2>

      </div>

      {/* ================= FIRST ROW ================= */}

      <div className="service-section">

        <div className="service-content">

          <h3>
            Personalized Beauty
          </h3>

          <p>
            Welcome to our world of luxury beauty.
            Every service is carefully customized
            to enhance your natural beauty while
            creating a relaxing experience you'll
            never forget.
          </p>

          <p>
            From hair transformations to premium
            beauty care, our experienced specialists
            deliver elegant results using modern
            techniques and luxury products.
          </p>

          <a href="#booking">
            BOOK APPOINTMENT
          </a>

        </div>

        <div className="service-image">

          <div className="image-frame">

            <img
              src={aboutHair}
              alt="Salon Service"
            />

          </div>

          <div className="dots dots-right"></div>

        </div>

      </div>

      {/* ================= SECOND ROW ================= */}

      <div className="service-section reverse">

        <div className="service-image">

          <div className="square-image">

            <img
              src={teamPortrait}
              alt="Our Team"
            />

          </div>

          <div className="dots dots-left"></div>

        </div>

        <div className="service-content">

          <h3>
            Meet Our Experts
          </h3>

          <p>
            Our talented professionals combine
            creativity, precision and passion
            to provide exceptional salon services
            tailored to every client.
          </p>

          <p>
            Every stylist continuously learns
            the latest beauty trends and luxury
            techniques to ensure an unforgettable
            salon experience.
          </p>

          <a href="#booking">
            MEET OUR TEAM
          </a>

        </div>

      </div>

    </section>
  );
}