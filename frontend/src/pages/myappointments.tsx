import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/navbar";
import "./myappointments.css";

type Service = {
  _id: string;
  name: string;
  price: number;
  duration: number;
};

type Staff = {
  _id: string;
  name: string;
  specialization: string;
};

type Customer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
};

type Appointment = {
  _id: string;
  customerId: Customer | string;
  serviceId: Service;
  staffId: Staff;
  date: string;
  time: string;
  duration: number;
  amount: number;
  status: string;
};

export default function MyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");

  const token = localStorage.getItem("token");
  const customerId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    if (!token || !customerId) {
      navigate("/login");
      return;
    }

    const fetchUserAppointments = async () => {
      try {
        setLoading(true);
        const res = await API.get("/appointments");

        // Filter appointments that belong to this logged in customer
        const allAppointments: Appointment[] = res.data.appointments || [];
        const userApps = allAppointments.filter((app) => {
          const appCustId = typeof app.customerId === "object" ? app.customerId?._id : app.customerId;
          return appCustId === customerId;
        });

        setAppointments(userApps);
      } catch (error) {
        console.error("Failed to load appointments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAppointments();
  }, [token, customerId, navigate]);

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      // Backend put status route: router.put("/:id/status", updateAppointmentStatus)
      await API.put(`/appointments/${id}/status`, { status: "cancelled" });

      // Update state
      setAppointments((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: "cancelled" } : app))
      );

      alert("Appointment cancelled successfully.");
    } catch (error) {
      console.error("Failed to cancel appointment", error);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  // Filter based on activeTab
  const filteredApps = appointments.filter((app) => {
    const status = app.status ? app.status.toLowerCase() : "pending";
    if (activeTab === "upcoming") {
      return status === "pending" || status === "confirmed";
    }
    if (activeTab === "completed") {
      return status === "completed";
    }
    if (activeTab === "cancelled") {
      return status === "cancelled";
    }
    return false;
  });

  // Sort: Upcoming sorted chronologically (earliest first); Completed and Cancelled sorted reverse-chronologically (latest first)
  filteredApps.sort((a, b) => {
    const dtA = `${a.date} ${a.time}`;
    const dtB = `${b.date} ${b.time}`;
    if (activeTab === "upcoming") {
      return dtA.localeCompare(dtB);
    } else {
      return dtB.localeCompare(dtA);
    }
  });

  return (
    <>
      <Navbar />
      <div className="my-appointments-page animate-fade-up">
        <div className="appointments-container">

          {/* Header Profile Area */}
          <div className="profile-header-card">
            <span className="profile-subtitle">CLIENT MEMBER CONCIERGE</span>
            <h2>My Account</h2>
            <div className="profile-info-grid">
              <div className="profile-meta-item">
                <span className="meta-label">Name</span>
                <span className="meta-value">{userName}</span>
              </div>
              <div className="profile-meta-item">
                <span className="meta-label">Role</span>
                <span className="meta-value client-role">Premium Member</span>
              </div>
            </div>
          </div>

          {/* Bookings Table List */}
          <div className="appointments-section-title">
            <h3>Scheduled Appointments</h3>
            <div className="gold-divider-short"></div>
          </div>

          {/* Tabs Navigation */}
          <div className="appointments-tabs">
            <button
              className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming ({appointments.filter(app => app.status === "pending" || app.status === "confirmed").length})
            </button>
            <button
              className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
              onClick={() => setActiveTab("completed")}
            >
              Completed ({appointments.filter(app => app.status === "completed").length})
            </button>
            <button
              className={`tab-btn ${activeTab === "cancelled" ? "active" : ""}`}
              onClick={() => setActiveTab("cancelled")}
            >
              Cancelled ({appointments.filter(app => app.status === "cancelled").length})
            </button>
          </div>

          {loading ? (
            <div className="appointments-loading">
              <div className="spinner-gold"></div>
              <p>Fetching scheduled services...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="appointments-empty-card">
              <p>You have no {activeTab} appointments at this moment.</p>
              <a href="/booking">
                <button className="book-now-btn">Book An Appointment</button>
              </a>
            </div>
          ) : (
            <div className="appointments-list-grid">
              {filteredApps.map((app) => (
                <div key={app._id} className="appointment-item-card">

                  {/* Status Indicator */}
                  <div className="appointment-card-header">
                    <span className={`status-badge ${(app.status === "pending" || app.status === "confirmed") ? "upcoming" : app.status.toLowerCase()}`}>
                      {(app.status === "pending" || app.status === "confirmed") ? "Upcoming" : app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                    <span className="appointment-price">Rs. {app.amount || app.serviceId?.price}</span>
                  </div>

                  {/* Body details */}
                  <div className="appointment-card-body">
                    <h4>{app.serviceId?.name || "Premium Hair Service"}</h4>

                    <div className="app-detail-row">
                      <span className="detail-icon">👤</span>
                      <span>Stylist: <strong>{app.staffId?.name}</strong></span>
                    </div>

                    <div className="app-detail-row">
                      <span className="detail-icon">📅</span>
                      <span>Date: <strong>{app.date}</strong></span>
                    </div>

                    <div className="app-detail-row">
                      <span className="detail-icon">⏰</span>
                      <span>Time: <strong>{app.time}</strong></span>
                    </div>

                    <div className="app-detail-row">
                      <span className="detail-icon">⌛</span>
                      <span>Duration: <strong>{app.duration || app.serviceId?.duration} mins</strong></span>
                    </div>
                  </div>

                  {/* Footer actions */}
                  {(app.status === "pending" || app.status === "confirmed") && (
                    <div className="appointment-card-footer">
                      <button
                        className="cancel-appointment-btn"
                        onClick={() => handleCancelAppointment(app._id)}
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
