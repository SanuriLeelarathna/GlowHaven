import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import h11 from "../assets/h11.jpg";
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
      <div
        className="login-card"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,)), url(${h11})`
        }}
      >

        <div className="login-logo">
          <h1>
            GlowHaven<span>.</span>
          </h1>
          <p>Beauty Salon</p>
        </div>

        <h2 className="login-title">Sign In</h2>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-input-group">
            <span className="login-icon">@</span>
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-input-group">
            <span className="login-icon">⌘</span>
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-button" type="submit">
            Sign In
            <span className="arrow">→</span>
          </button>
        </form>

        <div className="login-links">
          <button type="button" onClick={() => navigate("/signup")}>
            New User? Sign Up here
          </button>
        </div>

        <div className="forgot-password">
          <a href="#">Forgot Password?</a>
        </div>
      </div>
    </div>

  );
}