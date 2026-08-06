import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingUp,
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
        <div className="auth-background-orb auth-orb-one" />
        <div className="auth-background-orb auth-orb-two" />
        <div className="auth-grid-pattern" />

        <div className="auth-brand">
          <div className="auth-logo">
            <span>L</span>
          </div>

          <div className="auth-brand-copy">
            <strong>LeadFlow</strong>
            <span>CRM</span>
          </div>
        </div>

        <div className="auth-visual-content">
          <div className="auth-product-badge">
            <Sparkles size={15} />
            Modern sales workspace
          </div>

          <h1>
            Turn every opportunity into a stronger
            customer relationship.
          </h1>

          <p className="auth-visual-description">
            Manage your customers, leads, activities and
            sales performance from one intelligent and
            beautifully organized workspace.
          </p>

          <div className="auth-feature-list">
            <div>
              <CheckCircle2 size={18} />
              <span>
                Track customers and leads in real time
              </span>
            </div>

            <div>
              <TrendingUp size={18} />
              <span>
                Monitor pipeline and business performance
              </span>
            </div>

            <div>
              <ShieldCheck size={18} />
              <span>
                Secure authentication and private data
              </span>
            </div>
          </div>

          <div className="auth-preview-card">
            <div className="auth-preview-header">
              <div>
                <span>Monthly revenue</span>
                <strong>$48,720</strong>
              </div>

              <span className="auth-preview-growth">
                +18.4%
              </span>
            </div>

            <div className="auth-preview-chart">
              <span style={{ height: "35%" }} />
              <span style={{ height: "48%" }} />
              <span style={{ height: "42%" }} />
              <span style={{ height: "61%" }} />
              <span style={{ height: "56%" }} />
              <span style={{ height: "78%" }} />
              <span style={{ height: "92%" }} />
            </div>

            <div className="auth-preview-footer">
              <div>
                <span>Active leads</span>
                <strong>327</strong>
              </div>

              <div>
                <span>Conversion</span>
                <strong>24.8%</strong>
              </div>

              <div>
                <span>Customers</span>
                <strong>1,284</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-visual-footer">
          <span className="auth-status-dot" />
          Secure CRM workspace for growing teams
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-mobile-brand">
          <div className="auth-logo">
            <span>L</span>
          </div>

          <div className="auth-brand-copy">
            <strong>LeadFlow</strong>
            <span>CRM</span>
          </div>
        </div>

        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <p className="auth-eyebrow">
              Welcome back
            </p>

            <h2>Sign in to LeadFlow</h2>

            <p>
              Enter your account details to access your
              sales workspace.
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
                <Mail size={19} />

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
              <div className="auth-label-row">
                <span>Password</span>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <div className="auth-input">
                <LockKeyhole size={19} />

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

            <button
              className="auth-submit-button"
              type="submit"
              disabled={isSubmitting}
            >
              <span>
                {isSubmitting
                  ? "Signing in..."
                  : "Sign in"}
              </span>

              {!isSubmitting && (
                <ArrowRight size={18} />
              )}
            </button>
          </form>

          <div className="auth-security-note">
            <ShieldCheck size={17} />

            <span>
              Your account is protected by secure
              Supabase authentication.
            </span>
          </div>

          <p className="auth-switch">
            Don&apos;t have an account?

            <Link to="/register">
              Create your workspace
            </Link>
          </p>
        </div>

        <div className="auth-form-footer">
          © {new Date().getFullYear()} LeadFlow CRM
        </div>
      </section>
    </main>
  );
}

export default Login;