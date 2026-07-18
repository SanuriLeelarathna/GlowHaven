import aboutHair from "../assets/ab.jpg";
import teamPortrait from "../assets/team_portrait.png";
import "./about.css";


export default function About() {
  return (

    <section className="about-section" id="about">


      {/* ABOUT BUSINESS */}

      <div className="about-container">

        <div className="about-grid">


          {/* IMAGE */}

          <div className="about-image-box">

            <div className="image-card">

              <img
                src={aboutHair}
                alt="Luxury salon service"
                loading="lazy"
              />

            </div>

          </div>



          {/* CONTENT */}

          <div className="about-content">


            <span className="about-label">
              Our Philosophy
            </span>


            <h2 className="about-title">

              ABOUT
              <span> our </span>

              <br />

              BUSINESS

            </h2>



            <p>

              We believe beauty is deeply personal.
              Glow Haven was founded on the philosophy
              of specialized, highly attentive care in
              an intimate, relaxing space.

            </p>



            <p className="light-text">

              From custom color formulations to modern
              cutting techniques, we design customized
              solutions for your hair, lashes, and skin.
              We combine expertise with premium products
              to preserve your natural beauty.

            </p>



          </div>


        </div>

      </div>




      {/* TEAM SECTION */}


      <div className="about-container team-section" id="team">


        <div className="about-grid reverse">


          {/* CONTENT */}

          <div className="about-content">


            <span className="about-label">
              The Experts
            </span>



            <h2 className="about-title">

              <span>
                meet our
              </span>

              <br />

              EXPERT TEAM

            </h2>




            <p>

              Our talented team of licensed professionals
              are passionate about creativity, innovation,
              and delivering exceptional beauty experiences.

            </p>



            <p className="light-text">

              We stay ahead of modern trends and work
              together with every client to create
              personalized styles that match their lifestyle.

            </p>




            <a
              href="#booking"
              className="about-button"
            >
              Meet Us
            </a>



          </div>




          {/* IMAGE */}

          <div className="about-image-box">

            <div className="image-card team-image">


              <img
                src={teamPortrait}
                alt="Professional salon team"
                loading="lazy"
              />


            </div>

          </div>



        </div>


      </div>


    </section>

  );
}