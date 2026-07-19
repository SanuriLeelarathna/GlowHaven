import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import h11 from "../assets/pb.png";
import "./login.css";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please enter name, email and password");
      return;
    }

    try {
      await API.post("/auth/register", {
        name,
        email,
        phone,
        password,
        role: "customer",
      });

      alert("Sign up successful. Please login now.");
      navigate("/login");
    } catch (error: any) {
      alert(error.response?.data?.message || "Sign up failed");
    }
  };

  return (
    <div className="login-page">
      {/* LEFT: hero image panel */}
      <div
        className="login-image-panel"
        style={{ ["--login-hero-image" as any]: `url(${h11})` }}
      >
        <div className="login-brand">
          GlowHaven<span>.</span>
        </div>

        <div className="login-quote">
          <blockquote>"Your beauty story starts here."</blockquote>
          <div className="accent-rule" />
        </div>
      </div>

      {/* RIGHT: form panel */}
      <div className="login-form-panel">
        <div className="login-content">
          <div className="login-heading">
            <h1>Create Account</h1>
          </div>
          <p className="login-subtitle">
            Sign up to book your salon appointment.
          </p>

          <form className="login-form" onSubmit={handleSignup}>
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="name">Full name</label>
              </div>
              <input
                className="form-input"
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="email">Email address</label>
              </div>
              <input
                className="form-input"
                id="email"
                type="email"
                placeholder="name@haven.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="phone">Phone number</label>
              </div>
              <input
                className="form-input"
                id="phone"
                type="text"
                placeholder="+94 71 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="password">Password</label>
              </div>
              <input
                className="form-input"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="btn-signin" type="submit">
              Sign Up
            </button>
          </form>

          <p className="login-footer">
            Already have an account?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Login
            </a>
          </p>
        </div>

        <div className="login-copyright">
          © 2026 GlowHaven Luxury Salon. All rights reserved.
        </div>
      </div>
    </div>
  );
}