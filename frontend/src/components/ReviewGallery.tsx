import { useEffect, useState } from "react";
import "./reviewgallery.css";
import reviewBg from "../assets/review-bg.jpg";


interface Review {

    _id?: string;
    name: string;
    rating: number;
    comment: string;

}


export default function ReviewGallery() {


    const [reviews, setReviews] = useState<Review[]>([]);
    const [index, setIndex] = useState(0);
    const [animate, setAnimate] = useState(false);



    useEffect(() => {


        const fetchReviews = async () => {

            try {

                const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";
                const response = await fetch(
                    `${apiBase}/reviews`
                );


                const data = await response.json();

                setReviews(data);


            } catch (error) {

                console.log(
                    "Review loading error",
                    error
                );

            }

        };


        fetchReviews();


    }, []);





    useEffect(() => {


        if (reviews.length === 0)
            return;



        const timer = setInterval(() => {


            setAnimate(true);


            setTimeout(() => {


                setIndex(
                    prev =>
                        (prev + 1) % reviews.length
                );


                setAnimate(false);



            }, 500);



        }, 5000);



        return () => clearInterval(timer);



    }, [reviews]);






    if (reviews.length === 0) {


        return (

            <section className="reviews-section">


                <div className="reviews-container">


                    <span>
                        CLIENT LOVE
                    </span>


                    <h2>
                        What Our Guests Say
                    </h2>



                    <div className="review-card">

                        <p>
                            Your experience matters.
                            Share your beauty journey with us.
                        </p>

                    </div>


                </div>


            </section>

        );


    }





    const review = reviews[index];





    return (

        <section
            className="reviews-section"
            style={{
                backgroundImage: `url(${reviewBg})`,
            }}
        >
            <div className="reviews-overlay">
                <div className="reviews-container">




                    <span className="review-tag">
                        CLIENT LOVE
                    </span>



                    <h2>
                        What Our Guests Say
                    </h2>




                    <div
                        className={
                            `review-card ${animate ? "fade" : ""}`
                        }
                    >



                        <div className="stars">

                            {
                                Array.from({
                                    length: review.rating
                                }).map((_, i) => (

                                    <span key={i}>
                                        ★
                                    </span>

                                ))
                            }

                        </div>




                        <p className="review-message">

                            "{review.comment}"

                        </p>




                        <h4>
                            — {review.name}
                        </h4>




                        <small>

                            {index + 1} / {reviews.length}

                        </small>



                    </div>



                </div>
            </div>


        </section>


    );

}