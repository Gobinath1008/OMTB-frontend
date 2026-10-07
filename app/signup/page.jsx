"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "../../lib/apiBase";
import "./signup.css";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState(""); // customer name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const router = useRouter();

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Full name is required";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const res = await fetch(apiUrl("/auth/signup"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Signup Successful ✅");
        router.push("/login");
      } else {
        setErrors({ ...errors, form: data.message });
      }
    } catch (error) {
      console.error(error);
      alert("Error creating account ⚠️");
    }
  };

  const clearError = (field) => {
    setErrors({ ...errors, [field]: "" });
  };

  return (
    <div className="login-container signup-container">
      <form className="card" style={{ width: '100%', maxWidth: '400px' }} onSubmit={handleSignup}>
        <h2 className="text-center mb-3">Signup</h2>

        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            className="form-input"
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => { setUsername(e.target.value); clearError("username"); }}
            required
            style={errors.username ? { borderColor: "var(--danger)" } : {}}
          />
          {errors.username && <span className="text-danger" style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{errors.username}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            type="text"
            placeholder="Enter Full Name"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError("name"); }}
            required
            style={errors.name ? { borderColor: "var(--danger)" } : {}}
          />
          {errors.name && <span className="text-danger" style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
            required
            style={errors.email ? { borderColor: "var(--danger)" } : {}}
          />
          {errors.email && <span className="text-danger" style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
            required
            style={errors.password ? { borderColor: "var(--danger)" } : {}}
          />
          {errors.password && <span className="text-danger" style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{errors.password}</span>}
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Confirm Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
            required
            style={errors.confirmPassword ? { borderColor: "var(--danger)" } : {}}
          />
          {errors.confirmPassword && <span className="text-danger" style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{errors.confirmPassword}</span>}
        </div>

        {errors.form && <div className="text-danger text-center mb-2" style={{ color: 'var(--danger)' }}>{errors.form}</div>}

        <div className="flex flex-col gap-2">
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Signup
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => router.push("/login")}
            style={{ width: '100%' }}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}