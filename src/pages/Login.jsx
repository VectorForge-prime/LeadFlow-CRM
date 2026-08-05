import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    const { error: signInError } = await signIn({
      email: formData.email.trim(),
      password: formData.password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    const destination =
      location.state?.from?.pathname || "/";

    navigate(destination, {
      replace: true,
    });
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand">
          <div className="auth-logo">L</div>

          <div>
            <strong>LeadFlow</strong>
            <span>CRM</span>
          </div>
        </div>

        <div className="auth-visual-content">
          <p className="auth-eyebrow">
            Business growth platform
          </p>

          <h1>
            Turn every lead into a stronger customer
            relationship.
          </h1>

          <p>
            Manage customers, opportunities, tasks and
            sales performance from one modern workspace.
          </p>

          <div className="auth-feature-list">
            <span>
              Customer and lead management
            </span>

            <span>
              Sales pipeline tracking
            </span>

            <span>
              Tasks, calendar and analytics
            </span>
          </div>
        </div>

        <div className="auth-visual-footer">
          Trusted CRM workspace for growing teams.
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-wrapper">
          <div className="auth-mobile-brand">
            <div className="auth-logo">L</div>

            <div>
              <strong>LeadFlow</strong>
              <span>CRM</span>
            </div>
          </div>

          <div className="auth-form-header">
            <p className="auth-eyebrow">
              Welcome back
            </p>

            <h2>Sign in to your account</h2>

            <p>
              Access your customers, leads and sales
              pipeline.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <label>
              Email address

              <div className="auth-input">
                <Mail size={18} />

                <input
                  required
                  autoComplete="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </label>

            <label>
              Password

              <div className="auth-input">
                <LockKeyhole size={18} />

                <input
                  required
                  autoComplete="current-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  className="auth-password-button"
                  type="button"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword(
                      (currentValue) =>
                        !currentValue
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </label>

            <div className="auth-options">
              <span />

              <Link
                className="auth-text-button"
                to="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>

            <button
              className="auth-submit-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account?{" "}
            <Link to="/register">
              Create account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;