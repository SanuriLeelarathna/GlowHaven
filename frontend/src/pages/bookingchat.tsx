import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/navbar";
import "./bookingchat.css";

type Service = {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
};

type Staff = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  image?: string;
  rating?: number;
};

type ChatMessage = {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
  component?: React.ReactNode;
};

// Holds the finalized booking once confirmed — drives the confirmation modal
type ConfirmedBooking = {
  service: Service;
  staff: Staff;
  date: string;
  time: string;
};

const getImageSrc = (image?: string, fallback = "/assets/placeholder-service.jpg") => {
  if (!image) return fallback;
  if (image.startsWith("data:image")) return image;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/")) return image;
  return `/assets/${image}`;
};

const generateTimeSlots = (startTime: string, endTime: string, intervalMinutes: number, durationMinutes: number): string[] => {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  while (currentMinutes + durationMinutes <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    slots.push(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
    currentMinutes += intervalMinutes;
  }
  return slots;
};

export default function BookingChat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token");
  const customerId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  // State elements
  const [services, setServices] = useState<Service[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Selection states
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Confirmation popup state — set once booking succeeds, null otherwise.
  // Rendered as a modal at the page root (see JSX below) instead of an

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
  // inline chat bubble at the bottom of the thread.
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);

  // Active steps in the chat wizard
  const [currentStep, setCurrentStep] = useState<
    "greeting" | "service" | "date" | "time" | "staff" | "confirm" | "completed"
  >("greeting");

  const salonOpenTime = "09:00";
  const salonCloseTime = "17:00";
  const slotInterval = 15;

  const nextDates = (() => {
    const dates = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 6; i++) {
      const d = getServerTime();
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
    ? generateTimeSlots(salonOpenTime, salonCloseTime, slotInterval, selectedService.duration)
    : [];

  // Redirect admins
  useEffect(() => {
    if (token && userRole === "admin") {
      navigate("/dashboard");
    }
  }, [token, userRole, navigate]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Fetch Services & Restore booking state if returning from login
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const res = await API.get("/services");
        const serviceData = Array.isArray(res.data)
          ? res.data
          : res.data.services || res.data.data || [];
        setServices(serviceData);
      } catch (err) {
        console.error("Error loading services", err);
      }

      // Check if session was stored before redirecting to login
      const savedState = localStorage.getItem("savedBookingChat");
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          localStorage.removeItem("savedBookingChat");

          if (parsed.service) {
            setSelectedService(parsed.service);
            setSelectedDate(parsed.date || "");
            setSelectedTime(parsed.time || "");
            setSelectedStaff(parsed.staff || null);

            // Reconstruct chat history up to confirmation
            const history: ChatMessage[] = [
              {
                id: "init",
                sender: "bot",
                text: "Welcome back! I have restored your chat booking session. Let's review your details to complete your booking.",
                timestamp: new Date(),
              },
            ];

            setMessages(history);
            setCurrentStep("confirm");
            triggerBotResponse("confirm", parsed.service, parsed.date, parsed.time, parsed.staff);
            return;
          }
        } catch (e) {
          console.error("Error restoring saved chat booking", e);
        }
      }

      // If no saved state, run normal greeting
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages([
          {
            id: "welcome",
            sender: "bot",
            text: "Hello! 🌟 I'm Aria, your virtual beauty concierge. I will guide you through booking your luxury salon experience today in just a few quick steps. Let's start by choosing a service you would like to book:",
            timestamp: new Date(),
          },
        ]);
        setCurrentStep("service");
      }, 900);
    };

    loadInitial();
  }, []);

  // Fetch available staff when service, date, and time are selected
  useEffect(() => {
    const fetchStaffForSlot = async () => {
      if (!selectedService || !selectedDate || !selectedTime) return;
      setLoadingStaff(true);
      try {
        const res = await API.get(
          `/availability/service-based?serviceId=${selectedService._id}&date=${selectedDate}&time=${selectedTime}`
        );
        const staff = Array.isArray(res.data)
          ? res.data
          : res.data.availableStaff || res.data.staff || res.data.data || [];

        const enriched = staff.map((s: Staff, i: number) => ({
          ...s,
          rating: s.rating || Number((4.7 + (i % 3) * 0.1).toFixed(1)),
        }));
        setAvailableStaff(enriched);
      } catch (err) {
        console.error("Error fetching staff for slot", err);
        setAvailableStaff([]);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaffForSlot();
  }, [selectedService, selectedDate, selectedTime]);

  const addMessage = (msg: Omit<ChatMessage, "id" | "timestamp">) => {
    setMessages((prev) => [
      ...prev,
      {
        ...msg,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      },
    ]);
  };

  // Bot workflow logic
  const triggerBotResponse = (
    nextState: typeof currentStep,
    serviceObj = selectedService,
    dateVal = selectedDate,
    timeVal = selectedTime,
    staffObj = selectedStaff
  ) => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setCurrentStep(nextState);

      if (nextState === "date" && serviceObj) {
        addMessage({
          sender: "bot",
          text: `Wonderful! You selected **${serviceObj.name}** (Rs. ${serviceObj.price}). Now, please choose your preferred date for the appointment:`,
        });
      } else if (nextState === "time" && dateVal) {
        addMessage({
          sender: "bot",
          text: `Great choice. We are checking schedules for **${dateVal}**. What time would you prefer to visit us?`,
        });
      } else if (nextState === "staff" && dateVal && timeVal) {
        addMessage({
          sender: "bot",
          text: `Got it. Let's find a stylist available on **${dateVal}** at **${timeVal}**. Here are our expert specialists who are open at this hour. Who would you like to book?`,
        });
      } else if (nextState === "confirm" && serviceObj && dateVal && timeVal && staffObj) {
        addMessage({
          sender: "bot",
          text: `Excellent. Everything is set! Let's double check your booking summary before we confirm the appointment.`,
        });
      }
    }, 1000);
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    addMessage({
      sender: "user",
      text: `I'd like to book ${service.name}`,
    });
    triggerBotResponse("date", service);
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime("");
    setSelectedStaff(null);
    addMessage({
      sender: "user",
      text: `Let's schedule for ${dateStr}`,
    });
    triggerBotResponse("time", selectedService, dateStr);
  };

  const handleSelectTime = (timeStr: string) => {
    setSelectedTime(timeStr);
    setSelectedStaff(null);
    addMessage({
      sender: "user",
      text: `I prefer ${timeStr}`,
    });
    triggerBotResponse("staff", selectedService, selectedDate, timeStr);
  };

  const handleSelectStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    addMessage({
      sender: "user",
      text: `I'd like to book with ${staff.name}`,
    });
    triggerBotResponse("confirm", selectedService, selectedDate, selectedTime, staff);
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !selectedStaff) {
      alert("Missing booking details. Let's run through the chat steps again.");
      return;
    }

    if (!token || !customerId) {
      const chatState = {
        service: selectedService,
        date: selectedDate,
        time: selectedTime,
        staff: selectedStaff,
      };
      localStorage.setItem("savedBookingChat", JSON.stringify(chatState));
      alert("Sign-in is required to secure your booking. Redirecting you to login...");
      navigate("/login?redirect=/booking-chat");
      return;
    }

    try {
      setIsTyping(true);
      const res = await API.post("/appointments", {
        customerId,
        serviceId: selectedService._id,
        staffId: selectedStaff._id,
        date: selectedDate,
        time: selectedTime,
      });

      setIsTyping(false);
      setCurrentStep("completed");

      // Plain text confirmation stays in the chat thread...
      addMessage({
        sender: "bot",
        text: `🎉 **Success!** ${res.data.message || "Your appointment has been confirmed!"} \n\nWe have sent the confirmation to your account dashboard. We look forward to pampering you!`,
      });

      // ...but the receipt/details now show as a centered popup above the
      // whole page, instead of an inline card at the bottom of the chat.
      setConfirmedBooking({
        service: selectedService,
        staff: selectedStaff,
        date: selectedDate,
        time: selectedTime,
      });
    } catch (error: any) {
      setIsTyping(false);
      addMessage({
        sender: "bot",
        text: `❌ **Failed to book appointment:** ${error.response?.data?.message || "Something went wrong. Please try again."}`,
      });
    }
  };

  const closeConfirmationModal = () => {
    setConfirmedBooking(null);
  };

  // Chat message submission matching engine
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    addMessage({
      sender: "user",
      text: userText,
    });
    setInputValue("");

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = userText.toLowerCase();

      // Help trigger
      if (lower.includes("help") || lower.includes("menu")) {
        addMessage({
          sender: "bot",
          text: "I am Aria, your salon guide! I can help you select a service, select dates, and find stylists. Let me know what service you want (e.g. Cut, Color, Styling).",
        });
        return;
      }

      // Check current conversation step and parse matches
      if (currentStep === "service") {
        const matched = services.find(
          (s) =>
            lower.includes(s.name.toLowerCase()) ||
            s.name.toLowerCase().includes(lower) ||
            s.description.toLowerCase().includes(lower)
        );
        if (matched) {
          handleSelectService(matched);
        } else {
          addMessage({
            sender: "bot",
            text: "I couldn't match that with our styling menu. Please click on one of the premium service cards below:",
          });
        }
      } else if (currentStep === "date") {
        // Match weekday name or simple calendar terms
        const matchedDate = nextDates.find(
          (d) =>
            lower.includes(d.dayName.toLowerCase()) ||
            lower.includes(d.displayDate.toLowerCase())
        );
        if (matchedDate) {
          handleSelectDate(matchedDate.apiFormat);
        } else {
          addMessage({
            sender: "bot",
            text: "Please click on one of the dates in the list to select your appointment date:",
          });
        }
      } else if (currentStep === "time") {
        const matchedTime = timeSlots.find((t) => lower.includes(t));
        if (matchedTime) {
          handleSelectTime(matchedTime);
        } else {
          addMessage({
            sender: "bot",
            text: "Please select an available slot from the options listed below:",
          });
        }
      } else if (currentStep === "staff") {
        const matchedStaff = availableStaff.find(
          (s) =>
            lower.includes(s.name.toLowerCase()) ||
            s.name.toLowerCase().includes(lower)
        );
        if (matchedStaff) {
          handleSelectStaff(matchedStaff);
        } else {
          addMessage({
            sender: "bot",
            text: "Please click on one of our expert stylist profiles below to choose them:",
          });
        }
      } else if (currentStep === "confirm") {
        if (lower.includes("yes") || lower.includes("confirm") || lower.includes("book")) {
          handleConfirmBooking();
        } else {
          addMessage({
            sender: "bot",
            text: "Please review the confirmation card and click the **Confirm Appointment** button to finalize your reservation.",
          });
        }
      } else {
        addMessage({
          sender: "bot",
          text: "If you have any questions, feel free to contact us. To create a new booking, you can refresh this page at any time!",
        });
      }
    }, 1000);
  };

  return (
    <>
      <Navbar />
      <main className="booking-chat-page">
        <div className="chat-container-card">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="aria-profile-info">
              <div className="aria-avatar">
                <span>A</span>
                <span className="online-indicator"></span>
              </div>
              <div className="aria-text">
                <h3>Aria</h3>
                <p>Salon Concierge & AI Assistant</p>
              </div>
            </div>
            <div className="back-link-wrapper">
              <button className="back-to-booking-btn" onClick={() => navigate("/booking")}>
                Standard Booking
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages-area">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble-row ${msg.sender}-msg-row`}>
                {msg.sender === "bot" && (
                  <div className="msg-avatar-icon">A</div>
                )}
                <div className="msg-content-wrapper">
                  <div className="msg-bubble">
                    <p>{msg.text}</p>
                  </div>
                  {msg.component && <div className="custom-bubble-component">{msg.component}</div>}
                  <span className="msg-timestamp">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble-row bot-msg-row">
                <div className="msg-avatar-icon">A</div>
                <div className="msg-content-wrapper">
                  <div className="msg-bubble typing-bubble">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Quick-Replies (Static Context Controls) */}
          <div className="quick-replies-area">
            {currentStep === "service" && services.length > 0 && (
              <div className="quick-cards-grid animate-fade-up">
                {services.map((service) => (
                  <article
                    key={service._id}
                    className="reply-service-card"
                    onClick={() => handleSelectService(service)}
                  >
                    <img src={getImageSrc(service.image)} alt={service.name} />
                    <div className="card-info">
                      <h4>{service.name}</h4>
                      <p className="price">Rs. {service.price}</p>
                      <p className="duration">⏳ {service.duration} mins</p>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {currentStep === "date" && (
              <div className="date-carousel animate-fade-up">
                {nextDates.map((date) => (
                  <button
                    key={date.apiFormat}
                    className="reply-date-btn"
                    onClick={() => handleSelectDate(date.apiFormat)}
                  >
                    <span className="btn-day">{date.dayName}</span>
                    <span className="btn-date">{date.displayDate}</span>
                  </button>
                ))}
              </div>
            )}

            {currentStep === "time" && (
              <div className="time-chips-grid animate-fade-up">
                {timeSlots.map((time) => {
                  const disabled = isSlotPast(time);
                  return (
                    <button
                      key={time}
                      className={`reply-time-btn ${disabled ? 'disabled' : ''}`}
                      disabled={disabled}
                      onClick={() => handleSelectTime(time)}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}

            {currentStep === "staff" && (
              <div className="staff-cards-list animate-fade-up">
                {loadingStaff ? (
                  <div className="chat-loading-label">Loading matching experts...</div>
                ) : availableStaff.length === 0 ? (
                  <div className="chat-no-staff-warning">
                    No experts available for the selected slot.
                    <button className="chat-reset-step-btn" onClick={() => setCurrentStep("date")}>
                      Change Date/Time
                    </button>
                  </div>
                ) : (
                  availableStaff.map((staff) => (
                    <article
                      key={staff._id}
                      className="reply-staff-card"
                      onClick={() => handleSelectStaff(staff)}
                    >
                      <img
                        src={getImageSrc(staff.image, "/assets/placeholder-staff.jpg")}
                        alt={staff.name}
                      />
                      <div className="staff-meta">
                        <h4>{staff.name}</h4>
                        <span className="spec">{staff.specialization}</span>
                        <span className="rating">⭐ {staff.rating} (50+ reviews)</span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {currentStep === "confirm" && selectedService && selectedStaff && (
              <div className="luxury-review-container animate-fade-up">
                <div className="review-bill-card">
                  <h3>Glamour Salon Receipt</h3>
                  <div className="review-row">
                    <span>Service:</span>
                    <strong>{selectedService.name}</strong>
                  </div>
                  <div className="review-row">
                    <span>Stylist:</span>
                    <strong>{selectedStaff.name}</strong>
                  </div>
                  <div className="review-row">
                    <span>Date:</span>
                    <strong>{selectedDate}</strong>
                  </div>
                  <div className="review-row">
                    <span>Time:</span>
                    <strong>{selectedTime}</strong>
                  </div>
                  <div className="review-row">
                    <span>Duration:</span>
                    <strong>{selectedService.duration} mins</strong>
                  </div>
                  <div className="bill-divider"></div>
                  <div className="review-row total">
                    <span>Total Price:</span>
                    <strong>Rs. {selectedService.price}</strong>
                  </div>
                  <button className="chat-confirm-submit-btn" onClick={handleConfirmBooking}>
                    Confirm Appointment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Typing Message Form */}
          <form className="chat-input-bar" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder={
                currentStep === "completed"
                  ? "Booking complete!"
                  : `Ask Aria or type selection (e.g. "Haircut")...`
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={currentStep === "completed"}
            />
            <button type="submit" disabled={!inputValue.trim() || currentStep === "completed"}>
              Send
            </button>
          </form>
        </div>
      </main>

      {/* Booking Confirmation — centered popup overlaying the entire page,
          shown as soon as confirmedBooking is set by handleConfirmBooking() */}
      {confirmedBooking && (
        <div
          className="chat-success-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-confirmed-title"
          onClick={closeConfirmationModal}
        >
          <div className="chat-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon-ring">✓</div>
            <h4 id="booking-confirmed-title">Appointment Confirmed</h4>
            <div className="modal-gold-rule" />

            <div className="appointment-detail-row">
              <span>Service</span>
              <strong>{confirmedBooking.service.name}</strong>
            </div>
            <div className="appointment-detail-row">
              <span>Stylist</span>
              <strong>{confirmedBooking.staff.name}</strong>
            </div>
            <div className="appointment-detail-row">
              <span>Date</span>
              <strong>{confirmedBooking.date}</strong>
            </div>
            <div className="appointment-detail-row">
              <span>Time</span>
              <strong>{confirmedBooking.time}</strong>
            </div>
            <div className="appointment-detail-row">
              <span>Total</span>
              <strong>Rs. {confirmedBooking.service.price}</strong>
            </div>

            <button className="modal-confirm-btn" onClick={closeConfirmationModal}>
              Close
            </button>
            <button
              className="modal-secondary-btn"
              onClick={() => {
                closeConfirmationModal();
                navigate("/account");
              }}
            >
              Go to My Appointments
            </button>
          </div>
        </div>
      )}
    </>
  );
}