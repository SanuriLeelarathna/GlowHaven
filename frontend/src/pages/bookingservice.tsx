import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/navbar";
import "./bookingservices.css";
import ser1 from "../assets/ab.jpg";

type Category = {
  _id: string;
  name: string;
};

type Service = {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  category?: Category | string | null;
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
  services?: Service[];
  workingHours?: WorkingHour[];
};

type BookingStep = "idle" | "datetime" | "staff" | "confirmation";

const transparentPixel =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const getImageSrc = (
  image?: string,
  fallback = "/assets/placeholder-service.jpg"
) => {
  if (!image) return fallback;

  if (image.startsWith("data:image")) return image;

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/")) return image;

  return `/assets/${image}`;
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

export default function BookingService() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const customerId = localStorage.getItem("userId");

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

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // UI-only filter state for the category tab bar — does not affect
  // booking logic, just controls which cards render in the grid below.
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");

  const [bookingStep, setBookingStep] = useState<BookingStep>("idle");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [viewedProfileStaff, setViewedProfileStaff] = useState<Staff | null>(
    null
  );



  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(
    new Date().getMonth()
  );
  const [currentCalendarYear, setCurrentCalendarYear] = useState(
    new Date().getFullYear()
  );

  const salonOpenTime = "09:00";
  const salonCloseTime = "17:00";
  const slotInterval = 15;

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

      const year = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, "0");
      const dateStr = String(d.getDate()).padStart(2, "0");

      dates.push({
        dayName: days[d.getDay()],
        displayDate: `${d.getDate()} ${months[d.getMonth()]}`,
        apiFormat: `${year}-${monthStr}-${dateStr}`,
      });
    }

    return dates;
  })();

  const timeSlots = selectedService
    ? generateTimeSlots(
      salonOpenTime,
      salonCloseTime,
      slotInterval,
      selectedService.duration
    )
    : [];

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (userRole === "admin") {
      navigate("/dashboard");
    }
  }, [userRole, navigate]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);

        const res = await API.get("/services");

        const serviceData = Array.isArray(res.data)
          ? res.data
          : res.data.services || res.data.data || [];

        setServices(serviceData);
      } catch (error) {
        console.log("Failed to fetch services", error);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const fetchAvailableStaff = async () => {
      if (!selectedService || !selectedDate || !selectedTime) return;

      try {
        setLoadingStaff(true);

        const res = await API.get(
          `/availability/service-based?serviceId=${selectedService._id}&date=${selectedDate}&time=${selectedTime}`
        );

        const availableStaff = Array.isArray(res.data)
          ? res.data
          : res.data.availableStaff || res.data.staff || res.data.data || [];

        const enrichedStaff = availableStaff.map((staff: Staff, index: number) => ({
          ...staff,
          rating:
            staff.rating ||
            Number((4.7 + (index % 3) * 0.1).toFixed(1)),
        }));

        setStaffList(enrichedStaff);
      } catch (error) {
        console.log("Failed to fetch available staff", error);
        setStaffList([]);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchAvailableStaff();
  }, [selectedService, selectedDate, selectedTime]);

  const handleBookClick = (service: Service) => {
    if (!token) {
      localStorage.setItem("selectedService", JSON.stringify(service));
      navigate("/login?redirect=/booking-service");
      return;
    }

    setSelectedService(service);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedStaff(null);
    setStaffList([]);
    setBookingStep("datetime");
  };
  const handleStaffSelect = (staff: Staff) => {
    setSelectedStaff(staff);
  };

  const confirmAppointment = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !selectedStaff) {
      alert("Please complete all booking steps first.");
      return;
    }

    if (!customerId) {
      const bookingState = {
        service: selectedService,
        date: selectedDate,
        time: selectedTime,
        staff: selectedStaff,
      };

      localStorage.setItem("savedBookingService", JSON.stringify(bookingState));
      alert("Please login before confirming your appointment.");
      navigate("/login?redirect=/booking-service");
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

    const calendarGrid: {
      dayVal: number;
      isCurrentMonth: boolean;
      dateObj: string | null;
      isDisabled: boolean;
      isToday?: boolean;
    }[] = [];

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
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDateObj = new Date(
        currentCalendarYear,
        currentCalendarMonth,
        day
      );

      currentDateObj.setHours(0, 0, 0, 0);

      const year = currentDateObj.getFullYear();
      const monthStr = String(currentDateObj.getMonth() + 1).padStart(2, "0");
      const dateStr = String(currentDateObj.getDate()).padStart(2, "0");
      const apiFormat = `${year}-${monthStr}-${dateStr}`;

      calendarGrid.push({
        dayVal: day,
        isCurrentMonth: true,
        dateObj: apiFormat,
        isDisabled: currentDateObj < today,
        isToday: currentDateObj.getTime() === today.getTime(),
      });
    }

    return calendarGrid;
  };

  const daysGrid = getCalendarDays();

  // Derived, read-only: builds the tab list from whatever categories are
  // present on the fetched services, and filters the grid by the active tab.
  // Does not change how services are fetched or stored.
  const getServiceCategoryName = (service: Service): string => {
    if (!service.category) return "Uncategorized";
    if (typeof service.category === "string") return "Uncategorized";
    return service.category.name || "Uncategorized";
  };

  const getServiceCategoryId = (service: Service): string => {
    if (!service.category) return "uncategorized";
    if (typeof service.category === "string") return service.category;
    return service.category._id || "uncategorized";
  };

  const categoryTabs = (() => {
    const seen = new Map<string, string>();

    services.forEach((service) => {
      const id = getServiceCategoryId(service);
      const name = getServiceCategoryName(service);
      if (!seen.has(id)) seen.set(id, name);
    });

    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  })();

  const visibleServices =
    activeCategoryFilter === "all"
      ? services
      : services.filter(
        (service) => getServiceCategoryId(service) === activeCategoryFilter
      );

  return (
    <>
      <Navbar />

      <main className="booking-service-page">
        <section
          className="services-hero"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0,0,0,.6)), url(${ser1})`,
          }}
        >
          <div className="services-hero-overlay">
            <span className="hero-subtitle">Luxury Salon Services</span>

            <h1>
              Discover Our <span>Premium Services</span>
            </h1>

            <p>
              Experience professional hair, beauty, nail, and skincare treatments
              designed to enhance your confidence and style.
            </p>


          </div>
        </section>





        <section className="service-booking-list-section animate-fade-up" id="service-menu">
          <p className="menu-eyebrow">on the menu</p>


          {categoryTabs.length > 0 && (
            <div className="category-tab-bar">
              <button
                type="button"
                className={activeCategoryFilter === "all" ? "active" : ""}
                onClick={() => setActiveCategoryFilter("all")}
              >
                All
              </button>

              {categoryTabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  className={activeCategoryFilter === tab.id ? "active" : ""}
                  onClick={() => setActiveCategoryFilter(tab.id)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          )}

          {loadingServices ? (
            <div className="loading-placeholder">Loading services...</div>
          ) : visibleServices.length === 0 ? (
            <div className="loading-placeholder">No services available yet.</div>
          ) : (
            <div className="service-card-grid">
              {visibleServices.map((service) => (
                <article className="service-booking-card" key={service._id}>
                  <div className="service-card-image-box">
                    <img
                      src={getImageSrc(service.image)}
                      alt={service.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          "/assets/placeholder-service.jpg";
                      }}
                    />
                  </div>

                  <div className="service-card-content">
                    <h3>{service.name}</h3>
                    <p>
                      {service.description ||
                        "Premium salon service tailored for your beauty needs."}
                    </p>
                  </div>

                  <div className="service-card-footer">
                    <span>Rs. {service.price}</span>

                    <button
                      type="button"
                      onClick={() => handleBookClick(service)}
                    >
                      Book Now
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {bookingStep === "datetime" && selectedService && (
          <div className="datetime-popup-overlay">
            <div className="datetime-popup-card animate-fade-up">
              <div className="popup-header">
                <div>
                  <span className="step-count">STEP 01/03</span>
                  <h3>Select Date & Time</h3>
                </div>

                <button
                  type="button"
                  className="popup-close-btn"
                  onClick={() => setBookingStep("idle")}
                >
                  ✕
                </button>
              </div>

              <div className="popup-body">
                <div className="selected-summary-pill-bar">
                  <span>
                    Service: <strong>{selectedService.name}</strong>
                  </span>
                  <span>
                    Duration: <strong>{selectedService.duration} mins</strong>
                  </span>
                  <span>
                    Price: <strong>Rs. {selectedService.price}</strong>
                  </span>
                </div>

                <h4>01. Pick Date</h4>

                <div className="horizontal-date-scroll">
                  {nextDates.map((date) => (
                    <button
                      type="button"
                      key={date.apiFormat}
                      className={`date-selection-card ${selectedDate === date.apiFormat ? "selected" : ""
                        }`}
                      onClick={() => {
                        setSelectedDate(date.apiFormat);
                        setSelectedTime("");
                        setSelectedStaff(null);
                        setStaffList([]);
                      }}
                    >
                      <span className="card-day">{date.dayName}</span>
                      <span className="card-date">{date.displayDate}</span>
                      <span className="card-avail">Available</span>
                    </button>
                  ))}

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
                    Selected Date: <strong>{selectedDate}</strong>
                  </div>
                )}

                {selectedDate && (
                  <div className="popup-time-section animate-fade-up">
                    <h4>02. Pick Time</h4>

                    <div className="times-grid">
                      {timeSlots.map((time) => {
                        const disabled = isSlotPast(time);
                        return (
                          <button
                            type="button"
                            key={time}
                            className={`${selectedTime === time ? "selected-time" : ""} ${disabled ? "disabled-time-slot" : ""}`}
                            disabled={disabled}
                            onClick={() => {
                              setSelectedTime(time);
                              setSelectedStaff(null);
                              setStaffList([]);
                            }}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="popup-footer space-between">
                <button
                  type="button"
                  className="popup-back-btn"
                  onClick={() => setBookingStep("idle")}
                >
                  ← Back to Services
                </button>

                <button
                  type="button"
                  className="popup-confirm-btn"
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setBookingStep("staff")}
                >
                  Continue to Staff
                </button>
              </div>
            </div>
          </div>
        )}

        {bookingStep === "staff" &&
          selectedService &&
          selectedDate &&
          selectedTime && (
            <div className="datetime-popup-overlay">
              <div className="datetime-popup-card animate-fade-up wide-modal">
                <div className="popup-header">
                  <div>
                    <span className="step-count">STEP 02/03</span>
                    <h3>Select Available Staff</h3>
                  </div>

                  <button
                    type="button"
                    className="popup-close-btn"
                    onClick={() => setBookingStep("idle")}
                  >
                    ✕
                  </button>
                </div>

                <div className="popup-body">
                  <div className="selected-summary-pill-bar">
                    <span>
                      Service: <strong>{selectedService.name}</strong>
                    </span>
                    <span>
                      Date: <strong>{selectedDate}</strong>
                    </span>
                    <span>
                      Time: <strong>{selectedTime}</strong>
                    </span>
                  </div>

                  {loadingStaff ? (
                    <div className="loading-placeholder">
                      Loading available stylists...
                    </div>
                  ) : staffList.length === 0 ? (
                    <div className="no-availability-message">
                      No stylists are available for this date and time. Please
                      go back and select another date or time.
                    </div>
                  ) : (
                    <div className="premium-staff-modal-list">
                      {staffList.map((staff) => (
                        <div
                          key={staff._id}
                          className={`staff-modal-card ${selectedStaff?._id === staff._id ? "selected" : ""
                            }`}
                        >
                          <img
                            src={getImageSrc(
                              staff.image,
                              "/assets/placeholder-staff.jpg"
                            )}
                            alt={staff.name}
                            className="staff-avatar"
                            onError={(e) => {
                              e.currentTarget.src = transparentPixel;
                            }}
                          />

                          <div className="staff-meta-details">
                            <div className="staff-name-profile-row">
                              <h4>{staff.name}</h4>

                              <button
                                type="button"
                                className="staff-profile-btn-inline"
                                onClick={() => setViewedProfileStaff(staff)}
                              >
                                View Profile
                              </button>
                            </div>

                            <span className="staff-specialization">
                              {staff.specialization}
                            </span>

                            <div className="staff-rating-badge">
                              ⭐ {staff.rating || "4.8"}{" "}
                              <span className="rating-count">
                                (50+ reviews)
                              </span>
                            </div>
                          </div>

                          <div className="staff-actions-area">
                            <button
                              type="button"
                              className={`staff-select-action-btn ${selectedStaff?._id === staff._id
                                ? "active"
                                : ""
                                }`}
                              onClick={() => handleStaffSelect(staff)}
                            >
                              {selectedStaff?._id === staff._id
                                ? "Selected"
                                : "Select Staff"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="popup-footer space-between">
                  <button
                    type="button"
                    className="popup-back-btn"
                    onClick={() => setBookingStep("datetime")}
                  >
                    ← Back to Date & Time
                  </button>

                  <button
                    type="button"
                    className="popup-confirm-btn"
                    disabled={!selectedStaff}
                    onClick={() => setBookingStep("confirmation")}
                  >
                    Continue & Review
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
                  <div>
                    <span className="step-count">STEP 03/03</span>
                    <h3>Review & Confirm Appointment</h3>
                  </div>

                  <button
                    type="button"
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
                        src={getImageSrc(selectedService.image)}
                        alt={selectedService.name}
                        className="confirm-service-img"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/assets/placeholder-service.jpg";
                        }}
                      />

                      <div className="confirm-service-text">
                        <h3>{selectedService.name}</h3>
                        <p>{selectedService.description}</p>
                        <span className="confirm-badge">Premium Care</span>
                      </div>
                    </div>

                    <div className="confirm-receipt-area">
                      <h3>Receipt Overview</h3>
                      <div className="receipt-divider"></div>

                      <div className="receipt-row">
                        <span className="receipt-label">Stylist</span>
                        <span className="receipt-value">
                          {selectedStaff.name}
                        </span>
                      </div>

                      <div className="receipt-row">
                        <span className="receipt-label">Date</span>
                        <span className="receipt-value">{selectedDate}</span>
                      </div>

                      <div className="receipt-row">
                        <span className="receipt-label">Time</span>
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
                    type="button"
                    className="popup-back-btn"
                    onClick={() => setBookingStep("staff")}
                  >
                    ← Back/Edit
                  </button>

                  <button
                    type="button"
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
                  type="button"
                  className="calendar-close-btn"
                  onClick={() => setIsCalendarOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="calendar-grid-container">
                <div className="calendar-nav">
                  <button
                    type="button"
                    className="cal-nav-arrow"
                    onClick={handlePrevMonth}
                  >
                    ‹
                  </button>

                  <span className="cal-month-year">
                    {calendarMonths[currentCalendarMonth]}{" "}
                    {currentCalendarYear}
                  </span>

                  <button
                    type="button"
                    className="cal-nav-arrow"
                    onClick={handleNextMonth}
                  >
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
                      type="button"
                      key={index}
                      className={`calendar-day-btn ${!day.isCurrentMonth ? "other-month" : ""
                        } ${day.isDisabled ? "disabled" : ""} ${day.isToday ? "today" : ""
                        } ${selectedDate === day.dateObj ? "selected" : ""}`}
                      disabled={day.isDisabled}
                      onClick={() => {
                        if (day.dateObj) {
                          setSelectedDate(day.dateObj);
                          setSelectedTime("");
                          setSelectedStaff(null);
                          setStaffList([]);
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
                  type="button"
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
                  type="button"
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
                    e.currentTarget.src = transparentPixel;
                  }}
                />

                <h4>{viewedProfileStaff.name}</h4>
                <span className="profile-role">
                  {viewedProfileStaff.specialization}
                </span>

                <p className="profile-bio">
                  Dedicated beauty expert with professional salon experience,
                  styling knowledge, and a customer-focused approach.
                </p>

                <div className="profile-meta-info">
                  <div>
                    <strong>Email:</strong> {viewedProfileStaff.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {viewedProfileStaff.phone}
                  </div>
                  <div>
                    <strong>Rating:</strong> ⭐{" "}
                    {viewedProfileStaff.rating || "4.8"}
                  </div>
                </div>
              </div>

              <div className="calendar-modal-footer">
                <button
                  type="button"
                  className="calendar-done-btn"
                  onClick={() => setViewedProfileStaff(null)}
                >
                  Close Profile
                </button>
              </div>

            </div>
          </div>

        )}
        <section className="pamper-cta-section animate-fade-up">
          <div className="pamper-cta-text">
            <h1>
              Come <em>let us</em> <br /></h1>
            <h2>
              Make You Glow
            </h2>

            <p>
              Every treatment is performed by experienced stylists in a calm,
              welcoming space — designed around you, from the first
              consultation to the final touch.
            </p>

            <button
              type="button"
              className="pamper-cta-btn"
              onClick={() =>
                document
                  .getElementById("service-menu")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Get On The Books
            </button>
          </div>

          <div className="pamper-cta-media">
            <video
              src="/videos/stfp.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </section>
      </main>
    </>
  );
}
