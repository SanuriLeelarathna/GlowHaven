import Navbar from "../components/navbar";
import { useState, type FormEvent } from "react";
import "./Contact.css";

const Contact = () => {

    const [contact, setContact] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });

    const [review, setReview] = useState({
        name: "",
        rating: 5,
        comment: ""
    });

    const [submitted, setSubmitted] = useState(false);


    const handleContactChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {

        setContact({
            ...contact,
            [e.target.name]: e.target.value
        });

    };


    const handleReviewChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {

        setReview({
            ...review,
            [e.target.name]: e.target.value
        });

    };


    const submitContact = (e: FormEvent) => {

        e.preventDefault();

        console.log(contact);

        setSubmitted(true);

        setContact({
            name: "",
            email: "",
            phone: "",
            message: ""
        });

    };

    const submitReview = async (e: FormEvent) => {

        e.preventDefault();


        try {

            const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";
            const response = await fetch(
                `${apiBase}/reviews`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify(review)

                }
            );


            const data = await response.json();



            if (response.ok) {


                alert(
                    "Thank you for your review! It will appear after approval."
                );


                setReview({

                    name: "",

                    rating: 5,

                    comment: ""

                });


            } else {


                alert(data.message || "Failed to submit review");


            }



        } catch (error) {


            console.error(error);


            alert(
                "Server error. Please try again."
            );


        }

    };



    return (
        <>
            <Navbar />
            <div className="contact-page">


                {/* HERO */}

                <section className="contact-hero">

                    <div className="hero-overlay">

                        <p>GET IN TOUCH</p>

                        <h1>
                            Let's Create Your
                            <span> Perfect Look</span>
                        </h1>

                        <h3>
                            Have questions or need help with your appointment?
                            Our salon team is here to assist you.
                        </h3>


                    </div>

                </section>



                {/* CONTACT DETAILS */}


                <section className="contact-info">


                    <div className="contact-card">

                        <h3>📍 Visit Us</h3>

                        <p>
                            Luxury Beauty Salon
                            <br />
                            Colombo, Sri Lanka
                        </p>

                    </div>



                    <div className="contact-card">

                        <h3>☎ Call Us</h3>

                        <p>
                            +94 767052004
                        </p>

                    </div>




                    <div className="contact-card">

                        <h3>✉ Email</h3>

                        <p>
                            glowhaven0009@gmail.com
                        </p>

                    </div>



                    <div className="contact-card">

                        <h3>🕒 Opening Hours</h3>

                        <p>
                            Monday - Sunday
                            <br />
                            9.00 AM - 5.00 PM
                        </p>

                    </div>


                </section>




                {/* CONTACT FORM */}



                <section className="contact-form-section">


                    <div className="section-title">

                        <p>CONTACT US</p>

                        <h2>
                            Send Us A Message
                        </h2>

                    </div>



                    <form
                        className="contact-form"
                        onSubmit={submitContact}
                    >


                        <input

                            type="text"

                            name="name"

                            placeholder="Full Name"

                            value={contact.name}

                            onChange={handleContactChange}

                            required

                        />




                        <input

                            type="email"

                            name="email"

                            placeholder="Email Address"

                            value={contact.email}

                            onChange={handleContactChange}

                            required

                        />




                        <input

                            type="text"

                            name="phone"

                            placeholder="Phone Number"

                            value={contact.phone}

                            onChange={handleContactChange}

                        />




                        <textarea

                            name="message"

                            placeholder="Your Message"

                            rows={5}

                            value={contact.message}

                            onChange={handleContactChange}

                            required

                        />


                        <button>

                            Send Message

                        </button>


                        {
                            submitted &&
                            <p className="success-message">

                                Thank you! We will contact you soon.

                            </p>
                        }


                    </form>


                </section>





                {/* REVIEW SECTION */}



                <section className="review-section">


                    <div className="section-title">

                        <p>CUSTOMER EXPERIENCE</p>

                        <h2>
                            Share Your Experience
                        </h2>

                    </div>



                    <form
                        className="review-form"
                        onSubmit={submitReview}
                    >


                        <input

                            type="text"

                            name="name"

                            placeholder="Your Name"

                            value={review.name}

                            onChange={handleReviewChange}

                            required

                        />




                        <div className="rating">


                            <p>Your Rating</p>


                            <select

                                value={review.rating}

                                onChange={(e) =>

                                    setReview({

                                        ...review,

                                        rating: Number(e.target.value)

                                    })

                                }

                            >


                                <option value="5">
                                    ⭐⭐⭐⭐⭐
                                </option>


                                <option value="4">
                                    ⭐⭐⭐⭐
                                </option>


                                <option value="3">
                                    ⭐⭐⭐
                                </option>


                                <option value="2">
                                    ⭐⭐
                                </option>


                                <option value="1">
                                    ⭐
                                </option>


                            </select>


                        </div>




                        <textarea

                            name="comment"

                            placeholder="Write your review..."

                            rows={4}

                            value={review.comment}

                            onChange={handleReviewChange}

                            required

                        />


                        <button>

                            Submit Review

                        </button>


                    </form>


                </section>





                {/* LOCATION */}

                <section className="location-section">

                    <h2>
                        Find Our Salon
                    </h2>

                    <div className="map-box">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.815363107876!2d79.82118585474325!3d6.921833519655762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593cf65a1e9d%3A0xe13db457fa4d2f14!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2s!4v1720980000000!5m2!1sen!2s"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Salon Location Map"
                        ></iframe>
                    </div>

                </section>



            </div>

        </>
    );

};


export default Contact;