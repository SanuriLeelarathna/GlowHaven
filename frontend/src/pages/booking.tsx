import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import "./booking.css";

export default function Booking() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (!token) {
      navigate("/login?redirect=/booking");
      return;
    }
    if (userRole === "admin") {
      navigate("/dashboard");
    }
  }, [token, userRole, navigate]);

  if (!token || userRole === "admin") {
    return null; // Prevents flashing the content before redirecting
  }

  return (
    <div className="booking-page animate-fade-up">
      <Navbar />

      <div className="booking-container">
        <header className="booking-header">
          <span className="booking-meta"></span>
          <h1>Select Your Booking Experience</h1>
          <p>Choose the path that fits you best. Book through our classic curated directories or experience our smart assistant receptionist.</p>
        </header>

        <div className="booking-options-grid">
          {/* SERVICE BASED BOOKING */}
          <div className="booking-card service-card" onClick={() => navigate("/booking-service")}>
            <div className="card-image-tint"></div>
            <div className="card-number">01</div>
            <div className="card-body">
              <h2>Book by Service</h2>
              <p className="card-description">
                Browse our curated menu of hair therapies, bespoke cuts, and creative color treatments before selecting a slot.
              </p>
              <button className="booking-action-btn">
                Browse Menu
              </button>
            </div>
          </div>

          {/* STAFF BASED BOOKING */}
          <div className="booking-card staff-card" onClick={() => navigate("/Staff")}>
            <div className="card-image-tint"></div>
            <div className="card-number">02</div>
            <div className="card-body">
              <h2>Book by Stylist</h2>
              <p className="card-description">
                Directly meet our world-class collective of master stylists, review specialties, and schedule your appointment.
              </p>
              <button className="booking-action-btn">
                Meet Collective
              </button>
            </div>
          </div>

          {/* CONVERSATIONAL CHAT BOOKING */}
          <div className="booking-card chat-card highlight" onClick={() => navigate("/booking-chat")}>
            <div className="card-image-tint"></div>
            <div className="card-badge">Conversational</div>
            <div className="card-number">03</div>
            <div className="card-body">
              <h2>Chat with Aria (AI)</h2>
              <p className="card-description">
                Schedule your appointment through an interactive conversation. Get recommendations and match slots in seconds.
              </p>
              <button className="booking-action-btn primary">
                Launch Assistant
              </button>
            </div>
          </div>
        </div>

        <footer className="booking-footer-note">
          Need help? Contact our support line or visit our booking guidelines. © 2026 Glamour Salon
        </footer>
      </div>
    </div>
  );
}