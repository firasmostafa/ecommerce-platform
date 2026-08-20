import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

import { useAuth } from "../context/auth-context";
import "./Login.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: [],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      formData.password !==
      formData.password_confirmation
    ) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setFieldErrors({});

      await register(formData);

      navigate("/");
    } catch (err) {
      console.error("Registration failed:", err);

      setFieldErrors(
        err.response?.data?.errors || {}
      );

      setError(
        err.response?.data?.message ||
          "Unable to create your account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-left" />
      <div className="auth-decoration auth-decoration-right" />

      <div className="auth-card auth-card-register">
        <div className="auth-header">
          <div className="auth-icon">
            <UserPlus size={21} />
          </div>

          <span className="auth-eyebrow">
            JOIN NOVA
          </span>

          <h1>Create Account</h1>

          <p className="auth-description">
            Create your account to place orders,
            track deliveries and manage your purchases.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            <span>Full Name</span>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              autoComplete="name"
              required
            />

            {fieldErrors.name?.[0] && (
              <small className="auth-field-error">
                {fieldErrors.name[0]}
              </small>
            )}
          </label>

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

            {fieldErrors.email?.[0] && (
              <small className="auth-field-error">
                {fieldErrors.email[0]}
              </small>
            )}
          </label>

          <label>
            <span>Password</span>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              required
            />

            {fieldErrors.password?.[0] && (
              <small className="auth-field-error">
                {fieldErrors.password[0]}
              </small>
            )}
          </label>

          <label>
            <span>Confirm Password</span>

            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Repeat your password"
              autoComplete="new-password"
              minLength={8}
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
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Register;