import { useState } from "react";
import {
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setSuccessMessage("");

    if (formData.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const { data, error: signUpError } = await signUp({
      fullName: formData.fullName.trim(),
      company: formData.company.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      navigate("/", { replace: true });
      return;
    }

    setSuccessMessage(
      "Account created. Check your email and confirm your account before signing in."
    );

    setFormData({
      fullName: "",
      company: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }

  return (
    <main className="auth-page">
      <section className="auth-visual auth-register-visual">
        <div className="auth-brand">
          <div className="auth-logo">L</div>

          <div>
            <strong>LeadFlow</strong>
            <span>CRM</span>
          </div>
        </div>

        <div className="auth-visual-content">
          <p className="auth-eyebrow">
            Start growing today
          </p>

          <h1>
            Build a smarter sales process from your very
            first customer.
          </h1>

          <p>
            Create your workspace and manage every lead,
            task and opportunity from one place.
          </p>

          <div className="auth-feature-list">
            <span>
              Clean and modern customer database
            </span>
            <span>Visual sales pipeline</span>
            <span>
              Performance insights and reports
            </span>
          </div>
        </div>

        <div className="auth-visual-footer">
          One workspace. Better customer relationships.
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-wrapper auth-register-wrapper">
          <div className="auth-mobile-brand">
            <div className="auth-logo">L</div>

            <div>
              <strong>LeadFlow</strong>
              <span>CRM</span>
            </div>
          </div>

          <div className="auth-form-header">
            <p className="auth-eyebrow">
              Create workspace
            </p>

            <h2>Create your account</h2>

            <p>
              Start managing your sales process in minutes.
            </p>
          </div>

          {error && (
            <div className="auth-error">{error}</div>
          )}

          {successMessage && (
            <div className="auth-success">
              {successMessage}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-grid">
              <label>
                Full name

                <div className="auth-input">
                  <User size={18} />

                  <input
                    required
                    autoComplete="name"
                    name="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
              </label>

              <label>
                Company

                <div className="auth-input">
                  <Building2 size={18} />

                  <input
                    required
                    name="company"
                    type="text"
                    placeholder="Company name"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
              </label>
            </div>

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

            <div className="auth-form-grid">
              <label>
                Password

                <div className="auth-input">
                  <LockKeyhole size={18} />

                  <input
                    required
                    autoComplete="new-password"
                    name="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    placeholder="Minimum 6 characters"
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
                      setShowPassword((value) => !value)
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

              <label>
                Confirm password

                <div className="auth-input">
                  <LockKeyhole size={18} />

                  <input
                    required
                    autoComplete="new-password"
                    name="confirmPassword"
                    type={
                      showPassword ? "text" : "password"
                    }
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </label>
            </div>

            <button
              className="auth-submit-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;