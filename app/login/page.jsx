"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import "./login.css";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState({ value: "", error: "" });
  const [formError, setFormError] = useState("");
  const router = useRouter();

  const validateForm = () => {
    const idError = !identifier.trim()
      ? "Email or Username is required"
      : identifier.trim().length < 3
        ? "Email or Username must be at least 3 characters"
        : "";

    const passError = !password.value
      ? "Password is required"
      : password.value.length < 6
        ? "Password must be at least 6 characters"
        : "";

    setPassword({ value: password.value, error: passError });
    setFormError(idError);
    return !idError && !passError;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const idError = !identifier.trim()
      ? "Email or Username is required"
      : identifier.trim().length < 3
        ? "Email or Username must be at least 3 characters"
        : "";

    const passError = !password.value
      ? "Password is required"
      : password.value.length < 6
        ? "Password must be at least 6 characters"
        : "";

    if (idError) setFormError(idError);
    if (passError) setPassword({ value: password.value, error: passError });

    if (idError || passError) return;

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: identifier.trim(), password: password.value }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "admin") {
          router.push("/admin");
        } else if (data.user.role === "customer") {
          router.push("/customer");
        }
      } else {
        setFormError(data.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error(error);
      setFormError("Server Error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <form className="card" style={{ width: '100%', maxWidth: '400px' }} onSubmit={handleLogin}>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="btn btn-secondary back-button-inline"
        >
          <Home size={16} />
          <span>Home</span>
        </button>

        <h2 className="text-center mb-3">Login</h2>

        <div className="form-group mb-2">
          <label className="form-label">Email or Username</label>
          <input
            className="form-input"
            type="text"
            placeholder="Enter Email or Username"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (formError) setFormError("");
            }}
            style={formError ? { borderColor: "var(--danger)" } : {}}
          />
          {formError && (
            <span className="text-danger" style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
              {formError}
            </span>
          )}
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="Enter Password"
            value={password.value}
            onChange={(e) => {
              setPassword({ value: e.target.value, error: "" });
              if (password.error) setPassword({ value: e.target.value, error: "" });
            }}
            style={password.error ? { borderColor: "var(--danger)" } : {}}
          />
          {password.error && (
            <span className="text-danger" style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
              {password.error}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Login
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%' }}
            onClick={() => router.push("/signup")}
          >
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
}
