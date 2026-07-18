import { useEffect, useState } from "react";
import "./expect.css";

import image1 from "../assets/expect/e1.jpg";
import image2 from "../assets/expect/e2.jpg";
import image3 from "../assets/expect/e3.jpg";
import image4 from "../assets/expect/e4.jpg";
import image5 from "../assets/expect/e5.jpg";
import image6 from "../assets/expect/e6.jpg";


const images = [
    image1,
    image2,
    image3,
    image4,
    image5,
    image6,
];


export default function WhatToExpect() {


    const [current, setCurrent] = useState(0);



    useEffect(() => {

        const interval = setInterval(() => {

            setCurrent((prev) =>
                (prev + 1) % images.length
            );

        }, 4000);


        return () => clearInterval(interval);

    }, []);




    const nextSlide = () => {

        setCurrent((prev) =>
            (prev + 1) % images.length
        );

    };




    const prevSlide = () => {

        setCurrent((prev) =>
            prev === 0
                ? images.length - 1
                : prev - 1
        );

    };




    return (

        <section className="expect-section">


            {/* IMAGE SIDE */}

            <div className="expect-gallery">


                <div className="expect-image-wrapper">


                    {images.map((img, index) => (

                        <img
                            key={index}
                            src={img}
                            alt="Salon experience"
                            className={
                                `expect-image ${index === current
                                    ? "active"
                                    : ""
                                }`
                            }
                        />

                    ))}



                </div>




                <div className="slider-buttons">


                    <button onClick={prevSlide}>
                        ←
                    </button>


                    <button onClick={nextSlide}>
                        →
                    </button>


                </div>


            </div>






            {/* CONTENT SIDE */}


            <div className="expect-content">


                <span className="expect-label">
                    Salon Experience
                </span>



                <h2>

                    What to
                    <span> expect</span>

                </h2>




                <p>

                    Every visit is designed to give you
                    a relaxing and luxurious beauty
                    experience from the moment you arrive.

                </p>





                <ul>


                    <li>
                        Comfy Seating
                    </li>


                    <li>
                        Natural Light
                    </li>


                    <li>
                        Great Music on Shuffle
                    </li>


                    <li>
                        Complimentary Refreshments
                    </li>


                    <li>
                        Friendly Stylists
                    </li>


                    <li>
                        Top of the Line Products
                    </li>


                </ul>



            </div>



        </section>

    );
}