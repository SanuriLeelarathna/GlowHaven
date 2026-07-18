import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Booking from "./pages/booking";
import Dashboard from "./pages/dashboard";
import MyAppointments from "./pages/myappointments";
import Staff from "./pages/Staff";
import BookingServices from "./pages/bookingservice";
import Contact from "./pages/Contact";
import BookingChat from "./pages/bookingchat";
import Footer from "./components/footer";


export default function App() {
  const location = useLocation();
  const hideFooterRoutes = ["/login", "/signup", "/booking-chat"];
  const shouldShowFooter =
    !hideFooterRoutes.includes(location.pathname) &&
    !location.pathname.startsWith("/dashboard");

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Main Pages */}
        <Route path="/booking" element={<Booking />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/account" element={<MyAppointments />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/contact" element={<Contact />} />

        {/* Service-Based Booking */}
        <Route path="/booking-service" element={<BookingServices />} />

        {/* Conversational Booking */}
        <Route path="/booking-chat" element={<BookingChat />} />
      </Routes>
      {shouldShowFooter && <Footer />}
    </>
  );
}