import s1 from "../assets/s1.jpg";
import s2 from "../assets/brd.jpg";
import s3 from "../assets/wed.jpg";

import "./premiumservices.css";


export default function Services() {


  const servicesData = [


    {
      img: s1,
      title: "Golden Glow Facial",
      desc:
        "Luxury facial treatment designed to restore your natural glow with premium skincare techniques.",
      price: "Rs. 2,500",
      rating: "4.9",
      reviews: "120 Reviews",
      product: "Olaplex & Kerastase"
    },



    {
      img: s2,
      title: "Bridal Beauty",
      desc:
        "A complete bridal transformation experience crafted with elegance, beauty and perfection.",
      price: "Rs. 125,000",
      rating: "4.8",
      reviews: "85 Reviews",
      product: "L'Oréal Professionnel"
    },



    {
      img: s3,
      title: "Wedding Styling",
      desc:
        "Customized wedding looks created by professional artists for your unforgettable day.",
      price: "Rs. 7,500",
      rating: "5.0",
      reviews: "200 Reviews",
      product: "Moroccanoil"
    }



  ];





  return (


    <section
      className="premium-services"
      id="services"
    >



      <div className="premium-services-header">


        <span>
          OUR SIGNATURE SERVICES
        </span>



        <h2>

          Luxury Beauty
          <br />
          Experiences

        </h2>



        <p>

          Discover personalized beauty treatments
          created with premium products and expert care.

        </p>


      </div>





      <div className="premium-service-grid">


        {
          servicesData.map((service, index) => (


            <div
              className="premium-service-card"
              key={index}
            >



              <div className="premium-service-image">


                <img
                  src={service.img}
                  alt={service.title}
                />



                <div className="rating-badge">

                  ★ {service.rating}

                  <span>
                    ({service.reviews})
                  </span>

                </div>



              </div>







              <div className="premium-service-content">


                <h3>
                  {service.title}
                </h3>




                <p>

                  {service.desc}

                </p>






                <div className="product-box">


                  <span>
                    PREMIUM PRODUCTS
                  </span>


                  <strong>
                    {service.product}
                  </strong>


                </div>






                <div className="service-footer">


                  <h4>

                    {service.price}

                  </h4>



                  <button>

                    Explore

                  </button>


                </div>




              </div>





            </div>


          ))

        }


      </div>



    </section>


  );


}