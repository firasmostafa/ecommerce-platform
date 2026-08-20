import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

import { useAuth } from "../context/auth-context";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const response = await login(formData);

      const user =
        response.data?.user ||
        response.user;

      if (user?.role === "admin") {
        navigate("/admin");
        return;
      }

      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        "Unable to login. Please check your email and password.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-left" />
      <div className="auth-decoration auth-decoration-right" />

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <LogIn size={21} />
          </div>

          <span className="auth-eyebrow">
            WELCOME BACK
          </span>

          <h1>Sign In</h1>

          <p className="auth-description">
            Sign in to track your orders, view invoices,
            and manage your account.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            <span>Email</span>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            <span>Password</span>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={submitting}
          >
            {submitting
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Login;