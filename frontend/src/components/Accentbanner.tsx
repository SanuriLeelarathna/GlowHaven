import "./Accentbanner.css";

export default function AccentBanner() {
  return (
    <section className="accent-banner">

      <div className="accent-container">


        {/* Main Typography */}

        <h2 className="accent-title">

          BALAYAGE{" "}

          <span>
            hair extensions
          </span>

          {" "} | {" "}

          HAIR CUT{" "}

          <span>
            styling
          </span>

          {" "} COLOR{" "}

          <span>
            lash extensions
          </span>

          {" "} | {" "}

          FACIALS{" "}

          <span>
            makeup
          </span>


        </h2>




        {/* Description */}

        <p className="accent-description">

          Experience the difference of custom-tailored beauty.
          Our team of hair specialists and estheticians work
          together to deliver custom-tailored results.

        </p>




        {/* Button */}

        <a
          href="#about"
          className="accent-button"
        >
          Read Info
        </a>



      </div>


    </section>
  );
}