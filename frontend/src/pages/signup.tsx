import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

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
      <form
        className="login-card"
        onSubmit={handleSignup}

      >
        <h1>Create Account</h1>
        <p>Sign up to book your salon appointment</p>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Sign Up</button>

        <p className="small-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </form>
    </div>
  );
}