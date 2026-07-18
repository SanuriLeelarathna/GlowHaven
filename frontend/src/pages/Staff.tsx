import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/navbar";
import ownerNatalie from "../assets/owner_natalie.jpg";
/*import teamImg from "../assets/team.png";*/
import "./Staff.css";

type Service = {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
};

type WorkingHour = {
  day: string;
  startTime: string;
  endTime: string;
};

type Staff = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  image?: string;
  rating?: number;
  services: Service[];
  workingHours?: WorkingHour[];
};

export default function BookingSchedule() {
  const navigate = useNavigate();

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [bookingStep, setBookingStep] = useState<
    "idle" | "service" | "datetime" | "confirmation"
  >("idle");

  const [serverTimeOffset, setServerTimeOffset] = useState(0);

  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const res = await API.get("/appointments/server-time");
        const serverTime = new Date(res.data.serverTime);
        const clientTime = new Date();
        setServerTimeOffset(serverTime.getTime() - clientTime.getTime());
      } catch (err) {
        console.error("Failed to fetch server time offset:", err);
      }
    };
    fetchServerTime();
  }, []);

  const getServerTime = () => {
    return new Date(Date.now() + serverTimeOffset);
  };

  const isSlotPast = (timeStr: string) => {
    if (!selectedDate) return false;
    const now = getServerTime();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (selectedDate === todayStr) {
      const [h, m] = timeStr.split(":").map(Number);
      const slotMinutes = h * 60 + m;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      return slotMinutes < currentMinutes;
    }
    return selectedDate < todayStr;
  };

  const generateTimeSlots = (
    startTime: string,
    endTime: string,
    intervalMinutes: number,
    durationMinutes: number
  ): string[] => {
    const slots: string[] = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    while (currentMinutes + durationMinutes <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      slots.push(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
      );
      currentMinutes += intervalMinutes;
    }
    return slots;
  };

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(
    new Date().getMonth()
  );
  const [currentCalendarYear, setCurrentCalendarYear] = useState(
    new Date().getFullYear()
  );

  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");

  const [viewedProfileStaff, setViewedProfileStaff] = useState<Staff | null>(
    null
  );



  const [loadingStaff, setLoadingStaff] = useState(false);

  const customerId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const calendarMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];


  const getImageSrc = (
    image: string | undefined,
    fallback: string
  ): string => {
    if (!image) return fallback;

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:image")
    ) {
      return image;
    }

    if (image.startsWith("/")) {
      return image;
    }

    return `/assets/${image}`;
  };
  const isDateAvailableForStaff = (dateStr: string) => {
    if (!selectedStaff) return true;

    if (!selectedStaff.workingHours || selectedStaff.workingHours.length === 0) {
      return true;
    }

    const dayOfWeekIndex = new Date(dateStr).getDay();
    const dayName = daysOfWeek[dayOfWeekIndex];

    return selectedStaff.workingHours.some(
      (wh) => wh.day.toLowerCase() === dayName.toLowerCase()
    );
  };

  const handleDateSelect = (date: string) => {
    if (!isDateAvailableForStaff(date)) {
      alert("This staff member is not available on this day.");
      setSelectedDate("");
      setSelectedTime("");
      setAvailableSlots([]);
      return;
    }

    setSelectedDate(date);
    setSelectedTime("");
    setAvailableSlots([]);
  };

  const nextDates = (() => {
    const dates = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);

      const dayName = days[d.getDay()];
      const dayVal = d.getDate();
      const monthName = months[d.getMonth()];

      const year = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, "0");
      const dateStr = String(d.getDate()).padStart(2, "0");
      const apiFormat = `${year}-${monthStr}-${dateStr}`;

      dates.push({
        dayName,
        displayDate: `${dayVal} ${monthName}`,
        apiFormat,
      });
    }

    return dates;
  })();

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (userRole === "admin") {
      navigate("/dashboard");
    }
  }, [userRole, navigate]);

  useEffect(() => {
    const saved = localStorage.getItem("savedBookingStaff");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (parsed.staff) setSelectedStaff(parsed.staff);
        if (parsed.service) setSelectedService(parsed.service);
        if (parsed.date) setSelectedDate(parsed.date);
        if (parsed.time) setSelectedTime(parsed.time);

        setBookingStep("confirmation");
        localStorage.removeItem("savedBookingStaff");
      } catch (error) {
        console.error("Failed to restore saved staff booking session", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoadingStaff(true);

        const res = await API.get("/staff");

        const enriched = (res.data.staff || []).map((s: Staff, i: number) => ({
          ...s,
          services: s.services || [],
          workingHours: s.workingHours || [],
          rating:
            s.rating || parseFloat((4.7 + (i % 3) * 0.1).toFixed(1)),
        }));

        setStaffList(enriched);
      } catch (error) {
        console.log("Failed to fetch staff", error);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, []);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedStaff || !selectedService || !selectedDate) return;

      try {
        const res = await API.get(
          `/availability/staff-based?staffId=${selectedStaff._id}&serviceId=${selectedService._id}&date=${selectedDate}`
        );

        setAvailableSlots(res.data.availableSlots || []);
      } catch (error) {
        console.log("Failed to fetch available slots", error);
        setAvailableSlots([]);
      }
    };

    fetchAvailableSlots();
  }, [selectedStaff, selectedService, selectedDate]);

  const handleStaffSelect = (staff: Staff) => {
    if (!token) {
      localStorage.setItem("selectedStaff", JSON.stringify(staff));
      navigate("/login?redirect=/booking-staff");
      return;
    }

    setSelectedStaff(staff);
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setAvailableSlots([]);
    setBookingStep("service");
  };

  const confirmAppointment = async () => {
    if (!selectedStaff || !selectedService || !selectedDate || !selectedTime) {
      alert("Please complete all selection steps first.");
      return;
    }

    if (!customerId) {
      const bookingState = {
        staff: selectedStaff,
        service: selectedService,
        date: selectedDate,
        time: selectedTime,
      };

      localStorage.setItem("savedBookingStaff", JSON.stringify(bookingState));

      alert("Sign-in is required to confirm your booking. Redirecting you to login...");
      navigate("/login?redirect=/booking-staff");
      return;
    }

    try {
      const res = await API.post("/appointments", {
        customerId,
        serviceId: selectedService._id,
        staffId: selectedStaff._id,
        date: selectedDate,
        time: selectedTime,
      });

      alert(res.data.message || "Appointment booked successfully!");
      navigate("/account");
    } catch (error: any) {
      alert(error.response?.data?.message || "Appointment booking failed");
    }
  };

  const handlePrevMonth = () => {
    if (currentCalendarMonth === 0) {
      setCurrentCalendarMonth(11);
      setCurrentCalendarYear((prev) => prev - 1);
    } else {
      setCurrentCalendarMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentCalendarMonth === 11) {
      setCurrentCalendarMonth(0);
      setCurrentCalendarYear((prev) => prev + 1);
    } else {
      setCurrentCalendarMonth((prev) => prev + 1);
    }
  };

  const getCalendarDays = () => {
    const daysInMonth = new Date(
      currentCalendarYear,
      currentCalendarMonth + 1,
      0
    ).getDate();

    let firstDayIndex = new Date(
      currentCalendarYear,
      currentCalendarMonth,
      1
    ).getDay();

    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const calendarGrid = [];
    const today = getServerTime();
    today.setHours(0, 0, 0, 0);

    const prevMonthDays = new Date(
      currentCalendarYear,
      currentCalendarMonth,
      0
    ).getDate();

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      calendarGrid.push({
        dayVal: prevMonthDays - i,
        isCurrentMonth: false,
        dateObj: null,
        isDisabled: true,
        isToday: false,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const currentDateObj = new Date(
        currentCalendarYear,
        currentCalendarMonth,
        d
      );

      currentDateObj.setHours(0, 0, 0, 0);

      const year = currentDateObj.getFullYear();
      const monthStr = String(currentDateObj.getMonth() + 1).padStart(2, "0");
      const dateStr = String(currentDateObj.getDate()).padStart(2, "0");
      const apiFormat = `${year}-${monthStr}-${dateStr}`;

      const isDisabled =
        currentDateObj < today || !isDateAvailableForStaff(apiFormat);

      const isToday = currentDateObj.getTime() === today.getTime();

      calendarGrid.push({
        dayVal: d,
        isCurrentMonth: true,
        dateObj: apiFormat,
        isDisabled,
        isToday,
      });
    }

    return calendarGrid;
  };

  const daysGrid = getCalendarDays();

  return (
    <>
      <Navbar />

      <div className="schedule-page">
        {/* Luxury Hero Header Section */}
        <section className="staff-page-hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <span className="hero-tag">SALON & SPA</span>
            <h1 className="hero-title">
              BOOK <span className="serif-italic">with</span> ONE <span className="serif-italic">of</span><br />
              <span className="serif-italic">our</span> EXPERTS TODAY
            </h1>
            <p className="hero-subtitle-text">
              Dye shaved sides fiery blond highlights blowout, twist, headband hairband bouncy. Highlights salon weave twist caramel.
            </p>
            <button
              className="btn-oval"
              onClick={() => document.getElementById("our-team")?.scrollIntoView({ behavior: "smooth" })}
            >
              GET ON THE BOOKS
            </button>
          </div>
        </section>

        {/* Owner Showcase Section */}
        <section className="owner-section">
          <div className="owner-container">
            <div className="owner-image-column">
              <div className="owner-img-wrapper">
                <img src={ownerNatalie} alt="Natalie Simon" className="owner-img" />
              </div>
            </div>
            <div className="owner-text-column">
              <span className="owner-tag">meet the owner,</span>
              <h2 className="owner-title">NATALIE SIMON</h2>
              <div className="owner-description">
                <p>
                  Daxing yarge love, pressed laymand ange from lasy genereinate smem ploten-present, aggregate convenience added to santi decish momeamsat her headts.
                </p>
                <p>
                  Meeal marminously forgeemen movements, and cad some products they replaced want, leps, mercenary residence tailored save her. To thant considerid the machenksts, old and find behalelals women, and heted mnami latter meourage. Cooperated memnt out.
                </p>
              </div>
              <p className="owner-tagline">That's when Glow Haven was born</p>
            </div>
          </div>
        </section>

        {/* Our Team Section 
        <section className="team-section" id="team">
          <div className="team-large-title">Our Creative Team</div>

          <div className="team-container">
            {/* Left Content 
            <div className="team-text-content">
              <span className="section-subtitle">MEET OUR CREATIVES</span>

              <h2 className="section-title">
                The <span className="serif-italic">Artists</span> Behind <br /> Your <span className="serif-italic">Beauty</span>
              </h2>

              <p className="team-paragraph">
                At Glamour Salon, our talented team is the heart of our success.
                Our professional stylists combine creativity, care, and experience
                to deliver a personalized salon experience for every customer.
              </p>

              <a href="/#contact" className="team-contact-btn-link">
                <button className="team-outline-btn">Join Our Circle</button>
              </a>
            </div>

            {/* Right Image 
            <div className="team-image-wrapper">
              <img
                src={teamImg}
                alt="Glamour Salon Professional Stylists Team"
                className="team-main-img"
              />
            </div>
          </div>
        </section>

*/}

        {/* Creative Team Grid Section */}
        <section id="our-team" className="team-grid-section">
          <div className="team-section-header">
            <span className="team-subtitle">OUR TEAM OF</span>
            <h2 className="team-title">TALENTED PROFESSIONALS</h2>
          </div>

          {loadingStaff ? (
            <div className="loading-placeholder">Loading professionals...</div>
          ) : (
            <div className="talented-luxury-grid">
              {staffList.map((staff) => (
                <div key={staff._id} className="professional-card">
                  <div className="card-image-wrapper">
                    <img
                      src={getImageSrc(staff.image, "/assets/placeholder-staff.jpg")}
                      alt={staff.name}
                      onError={(e) => {
                        e.currentTarget.src = "/assets/placeholder-staff.jpg";
                      }}
                    />
                  </div>
                  <div className="card-info">
                    <h3 className="card-name">{staff.name}</h3>
                    <span className="card-role">{staff.specialization}</span>
                    <p className="card-bio">
                      {staff.name.includes("Crissy") || staff.name.includes("Lee") ? "A brief bio can go here. Bouncy, super fresh and detailed evider evidence tailored for your local..." :
                        staff.name.includes("Jerrika") || staff.name.includes("Thompson") ? "A brief bio can go here. Bouncy, super fresh and detailed evider evidence tailored for your local..." :
                          staff.name.includes("Mia") || staff.name.includes("Lombardi") ? "A brief bio can go here. Bouncy, super fresh and detailed evider evidence tailored for your local..." :
                            staff.name.includes("Jamie") || staff.name.includes("Stevens") ? "A brief bio can go here. Bouncy, super fresh and detailed evider evidence tailored for your local..." :
                              staff.name.includes("Allie") || staff.name.includes("White") ? "A brief bio can go here. Bouncy, super fresh and detailed evider evidence tailored for your local..." :
                                staff.name.includes("Imani") || staff.name.includes("Williams") ? "A brief bio can go here. Bouncy, super fresh and detailed evider evidence tailored for your local..." :
                                  "A brief bio can go here. Bouncy, super fresh and detailed evider evidence tailored for your local..."}
                    </p>

                    <div className="card-actions">
                      <button
                        className="read-more-link"
                        onClick={() => setViewedProfileStaff(staff)}
                      >
                        READ MORE
                      </button>
                      <button
                        className="book-now-link"
                        onClick={() => handleStaffSelect(staff)}
                      >
                        BOOK NOW
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="star-ornament-wrapper">
            <svg className="star-ornament" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
            </svg>
          </div>
        </section>


        {bookingStep === "service" && selectedStaff && (
          <div className="datetime-popup-overlay">
            <div className="datetime-popup-card animate-fade-up wide-modal">
              <div className="popup-header">
                <div className="header-title-area">
                  <span className="step-count">STEP 01/03</span>
                  <h3>Select Service with {selectedStaff.name}</h3>
                </div>

                <button
                  className="popup-close-btn"
                  onClick={() => setBookingStep("idle")}
                >
                  ✕
                </button>
              </div>

              <div className="popup-body">
                <p className="modal-description">
                  Please select one of the premium styling services offered by{" "}
                  {selectedStaff.name}.
                </p>

                <div className="horizontal-service-cards-container">
                  {(selectedStaff.services || []).map((service) => (
                    <div
                      key={service._id}
                      className="horizontal-service-card animate-fade-up"
                    >
                      <div className="h-card-img-wrapper">
                        <img
                          src={getImageSrc(
                            service.image,
                            "/assets/placeholder-service.jpg"
                          )}
                          alt={service.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              "/assets/placeholder-service.jpg";
                          }}
                        />
                      </div>

                      <div className="h-card-info">
                        <div className="h-card-meta">
                          <h3>{service.name}</h3>
                          <p className="h-card-desc">
                            {service.description ||
                              "Premium styling service tailored specifically for you."}
                          </p>
                        </div>

                        <div className="h-card-details">
                          <div className="detail-pill">
                            <span className="pill-icon">⏳</span>
                            <span>{service.duration} mins</span>
                          </div>

                          <div className="detail-pill price-pill">
                            <span>Rs. {service.price}</span>
                          </div>
                        </div>
                      </div>

                      <div className="h-card-action">
                        <button
                          className={`h-card-book-btn ${selectedService?._id === service._id
                            ? "selected-btn"
                            : ""
                            }`}
                          onClick={() => {
                            setSelectedService(service);
                            setSelectedDate("");
                            setSelectedTime("");
                            setAvailableSlots([]);
                          }}
                        >
                          {selectedService?._id === service._id
                            ? "Selected"
                            : "Select Service"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="popup-footer space-between">
                <button
                  className="popup-back-btn"
                  onClick={() => setBookingStep("idle")}
                >
                  ← Back to Stylists
                </button>

                <button
                  className="popup-confirm-btn"
                  disabled={!selectedService}
                  onClick={() => setBookingStep("datetime")}
                >
                  Continue to Date & Time
                </button>
              </div>
            </div>
          </div>
        )}

        {bookingStep === "datetime" && selectedService && selectedStaff && (
          <div className="datetime-popup-overlay">
            <div className="datetime-popup-card animate-fade-up">
              <div className="popup-header">
                <div className="header-title-area">
                  <span className="step-count">STEP 02/03</span>
                  <h3>Select Date & Time</h3>
                </div>

                <button
                  className="popup-close-btn"
                  onClick={() => setBookingStep("idle")}
                >
                  ✕
                </button>
              </div>

              <div className="popup-body">
                <div className="selected-summary-pill-bar">
                  <span>
                    Stylist: <strong>{selectedStaff.name}</strong>
                  </span>

                  <span>
                    Service: <strong>{selectedService.name}</strong>
                  </span>
                </div>

                <h4>01. Pick Date</h4>

                <div className="horizontal-date-scroll">
                  {nextDates.map((dateItem) => {
                    const isAvailable = isDateAvailableForStaff(
                      dateItem.apiFormat
                    );

                    return (
                      <button
                        key={dateItem.apiFormat}
                        disabled={!isAvailable}
                        className={`date-selection-card ${selectedDate === dateItem.apiFormat ? "selected" : ""
                          } ${!isAvailable ? "disabled" : ""}`}
                        onClick={() => handleDateSelect(dateItem.apiFormat)}
                      >
                        <span className="card-day">{dateItem.dayName}</span>
                        <span className="card-date">
                          {dateItem.displayDate}
                        </span>
                        <span className="card-avail">
                          {isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    className="date-selection-card custom-trigger"
                    onClick={() => setIsCalendarOpen(true)}
                  >
                    <span className="card-day">Custom</span>
                    <span className="card-date">Calendar</span>
                    <span className="card-avail">+ More dates</span>
                  </button>
                </div>

                {selectedDate && (
                  <div className="selected-date-confirm-pill">
                    Selected Appointment Date: <strong>{selectedDate}</strong>
                  </div>
                )}

                {selectedDate && (
                  <div className="popup-time-section animate-fade-up">
                    <h4>02. Pick Available Time Slot</h4>

                    <div className="times-grid">
                      {(() => {
                        const dayOfWeekIndex = new Date(selectedDate).getDay();
                        const dayName = daysOfWeek[dayOfWeekIndex];
                        const workingDay = selectedStaff?.workingHours?.find(
                          (wh) => wh.day.toLowerCase() === dayName.toLowerCase()
                        );
                        const allSlots = workingDay && selectedService
                          ? generateTimeSlots(workingDay.startTime, workingDay.endTime, 15, selectedService.duration)
                          : [];

                        if (allSlots.length === 0) {
                          return (
                            <div className="no-availability-message">
                              Unfortunately, there are no slots available for this
                              stylist on this date. Please select another date.
                            </div>
                          );
                        }

                        return allSlots.map((time) => {
                          const isAvailable = availableSlots.includes(time);
                          const isPast = isSlotPast(time);
                          const disabled = !isAvailable || isPast;
                          return (
                            <button
                              key={time}
                              className={`${selectedTime === time ? "selected-time" : ""} ${disabled ? "disabled-time-slot" : ""}`}
                              disabled={disabled}
                              onClick={() => setSelectedTime(time)}
                            >
                              {time}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

              <div className="popup-footer space-between">
                <button
                  className="popup-back-btn"
                  onClick={() => setBookingStep("service")}
                >
                  ← Back to Services
                </button>

                <button
                  className="popup-confirm-btn"
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setBookingStep("confirmation")}
                >
                  Continue & Review Summary
                </button>
              </div>
            </div>
          </div>
        )}

        {bookingStep === "confirmation" &&
          selectedService &&
          selectedStaff &&
          selectedDate &&
          selectedTime && (
            <div className="datetime-popup-overlay">
              <div className="datetime-popup-card animate-fade-up wide-confirmation-modal">
                <div className="popup-header">
                  <div className="header-title-area">
                    <span className="step-count">STEP 03/03</span>
                    <h3>Review & Confirm Appointment</h3>
                  </div>

                  <button
                    className="popup-close-btn"
                    onClick={() => setBookingStep("idle")}
                  >
                    ✕
                  </button>
                </div>

                <div className="popup-body">
                  <div className="luxury-confirmation-grid">
                    <div className="confirm-service-summary">
                      <img
                        src={getImageSrc(
                          selectedService.image,
                          "/assets/placeholder-service.jpg"
                        )}
                        alt={selectedService.name}
                        className="confirm-service-img"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/assets/placeholder-service.jpg";
                        }}
                      />

                      <div className="confirm-service-text">
                        <h3>{selectedService.name}</h3>
                        <p>
                          {selectedService.description ||
                            "Premium styling service tailored specifically for you."}
                        </p>
                        <span className="confirm-badge">Premium Care</span>
                      </div>
                    </div>

                    <div className="confirm-receipt-area">
                      <h3>Receipt Overview</h3>
                      <div className="receipt-divider"></div>

                      <div className="receipt-row">
                        <span className="receipt-label">Stylist Specialist</span>
                        <span className="receipt-value">
                          {selectedStaff.name}
                        </span>
                      </div>

                      <div className="receipt-row">
                        <span className="receipt-label">Scheduled Date</span>
                        <span className="receipt-value">{selectedDate}</span>
                      </div>

                      <div className="receipt-row">
                        <span className="receipt-label">Scheduled Time</span>
                        <span className="receipt-value">{selectedTime}</span>
                      </div>

                      <div className="receipt-row">
                        <span className="receipt-label">Duration</span>
                        <span className="receipt-value">
                          {selectedService.duration} minutes
                        </span>
                      </div>

                      <div className="receipt-divider"></div>

                      <div className="receipt-row total-amount-row">
                        <span className="receipt-label">Total Amount</span>
                        <span className="receipt-value">
                          Rs. {selectedService.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="popup-footer space-between">
                  <button
                    className="popup-back-btn"
                    onClick={() => setBookingStep("datetime")}
                  >
                    ← Back/Edit
                  </button>

                  <button
                    className="confirm-appointment-submit-btn"
                    onClick={confirmAppointment}
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          )}

        {isCalendarOpen && (
          <div className="calendar-modal-overlay">
            <div className="calendar-modal-card animate-fade-up">
              <div className="calendar-modal-header">
                <h3>Select Custom Date</h3>

                <button
                  className="calendar-close-btn"
                  onClick={() => setIsCalendarOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="calendar-grid-container">
                <div className="calendar-nav">
                  <button className="cal-nav-arrow" onClick={handlePrevMonth}>
                    ‹
                  </button>

                  <span className="cal-month-year">
                    {calendarMonths[currentCalendarMonth]}{" "}
                    {currentCalendarYear}
                  </span>

                  <button className="cal-nav-arrow" onClick={handleNextMonth}>
                    ›
                  </button>
                </div>

                <div className="calendar-weekdays">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                  <div>Sun</div>
                </div>

                <div className="calendar-days-grid">
                  {daysGrid.map((day, index) => (
                    <button
                      key={index}
                      className={`calendar-day-btn ${!day.isCurrentMonth ? "other-month" : ""
                        } ${day.isDisabled ? "disabled" : ""} ${day.isToday ? "today" : ""
                        } ${selectedDate === day.dateObj ? "selected" : ""}`}
                      disabled={day.isDisabled}
                      onClick={() => {
                        if (day.dateObj) {
                          handleDateSelect(day.dateObj);
                          setIsCalendarOpen(false);
                        }
                      }}
                    >
                      {day.dayVal}
                    </button>
                  ))}
                </div>
              </div>

              <div className="calendar-modal-footer">
                <button
                  className="calendar-done-btn"
                  onClick={() => setIsCalendarOpen(false)}
                >
                  Close Calendar
                </button>
              </div>
            </div>
          </div>
        )}

        {viewedProfileStaff && (
          <div className="calendar-modal-overlay">
            <div className="calendar-modal-card animate-fade-up profile-details-card">
              <div className="calendar-modal-header">
                <h3>{viewedProfileStaff.name} — Profile</h3>

                <button
                  className="calendar-close-btn"
                  onClick={() => setViewedProfileStaff(null)}
                >
                  ✕
                </button>
              </div>

              <div className="profile-modal-content">
                <img
                  src={getImageSrc(
                    viewedProfileStaff.image,
                    "/assets/placeholder-staff.jpg"
                  )}
                  alt={viewedProfileStaff.name}
                  className="profile-modal-avatar"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/placeholder-staff.jpg";
                  }}
                />

                <h4>{viewedProfileStaff.name}</h4>

                <span className="profile-role">
                  {viewedProfileStaff.specialization}
                </span>

                <p className="profile-bio">
                  Dedicated beauty expert with extensive training in
                  cutting-edge styles, hair rejuvenation treatments, and premium
                  colors. Known for meticulous attention to client satisfaction.
                </p>

                <div className="profile-meta-info">
                  <div>
                    <strong>Email:</strong> {viewedProfileStaff.email}
                  </div>

                  <div>
                    <strong>Phone:</strong> {viewedProfileStaff.phone}
                  </div>

                  <div>
                    <strong>Stylist Rating:</strong> ⭐{" "}
                    {viewedProfileStaff.rating} (Highly Rated)
                  </div>
                </div>
              </div>

              <div className="calendar-modal-footer">
                <button
                  className="calendar-done-btn"
                  onClick={() => setViewedProfileStaff(null)}
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}