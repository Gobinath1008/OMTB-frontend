"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Home } from "lucide-react";
import { apiUrl } from "../../lib/apiBase";
import "./login.css";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [password, setPassword] = useState({ value: "", error: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    const idError = !identifier.trim()
      ? "Email or Username is required"
      : identifier.trim().length < 3
        ? "Email or Username must be at least 3 characters"
        : "";

    const passError = !password.value
      ? "Password is required"
      : "";

    setIdentifierError(idError);
    setFormError("");
    setPassword({ value: password.value, error: passError });

    if (idError || passError) return;

    try {
      const res = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: identifier.trim(), password: password.value }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        const role = String(data.user.role || "").replace(/^ROLE_/i, "").toLowerCase();
        const user = { ...data.user, role };
        localStorage.setItem("user", JSON.stringify(user));

        if (role === "admin") {
          router.push("/admin");
        } else if (role === "customer") {
          router.push("/customer");
        } else {
          localStorage.removeItem("user");
          setFormError("Your account has an unsupported role. Contact an administrator.");
        }
      } else {
        setFormError(data.message || "We couldn't sign you in. Check your email/username and password.");
      }
    } catch (error) {
      console.error(error);
      setFormError("Unable to reach the sign-in service. Check your connection and try again.");
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
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              setIdentifierError("");
              setFormError("");
            }}
            aria-invalid={Boolean(identifierError)}
          />
          {identifierError && (
            <span className="text-danger" style={{ color: "var(--danger)", fontSize: "0.85rem" }}>
              {identifierError}
            </span>
          )}
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Password</label>
          <div className="password-input-wrap">
            <input
              className="form-input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              autoComplete="current-password"
              required
              value={password.value}
              onChange={(e) => {
                setPassword({ value: e.target.value, error: "" });
                setFormError("");
              }}
              aria-invalid={Boolean(password.error || formError)}
            />
            <button
              type="button"
              className="password-visibility-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {password.error && (
            <span className="text-danger" style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
              {password.error}
            </span>
          )}
        </div>

        {formError && (
          <p className="login-error" role="alert">
            {formError}
          </p>
        )}

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
