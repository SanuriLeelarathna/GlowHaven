import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import h11 from "../assets/pb.png";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.user.name);
      localStorage.setItem("userRole", res.data.user.role);

      // Dynamic redirect
      const defaultRedirect = res.data.user.role === "admin" ? "/dashboard" : "/booking";
      const redirectPath = searchParams.get("redirect") || defaultRedirect;
      navigate(redirectPath);
    } catch (error: any) {
      alert(error.response?.data?.message || "Login failed");
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
          <blockquote>"Luminous beauty begins within the shadows."</blockquote>
          <div className="accent-rule" />
        </div>
      </div>

      {/* RIGHT: form panel */}
      <div className="login-form-panel">
        <div className="login-content">
          <div className="login-heading">
            <h1>Welcome Back</h1>
          </div>
          <p className="login-subtitle">
            Sign in to access your curated luxury beauty experience.
          </p>

          <form className="login-form" onSubmit={handleLogin}>
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
                <label htmlFor="password">Password</label>
                <a className="forgot-link" href="#">
                  Forgot?
                </a>
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
              Sign In
            </button>
          </form>

          <p className="login-footer">
            Don't have an account?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
            >
              Create account
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