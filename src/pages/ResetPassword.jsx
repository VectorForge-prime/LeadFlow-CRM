import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../services/supabase";

function ResetPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [isRecoverySession, setIsRecoverySession] =
    useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setErrorMessage(error.message);
      }

      setIsRecoverySession(Boolean(session));
      setCheckingSession(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) {
          return;
        }

        if (
          event === "PASSWORD_RECOVERY" ||
          event === "SIGNED_IN"
        ) {
          setIsRecoverySession(Boolean(session));
          setCheckingSession(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (formData.password.length < 6) {
      setErrorMessage(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const { error } =
      await supabase.auth.updateUser({
        password: formData.password,
      });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(
      "Your password was changed successfully."
    );

    setFormData({
      password: "",
      confirmPassword: "",
    });

    window.setTimeout(async () => {
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    }, 1800);
  }

  if (checkingSession) {
    return (
      <main className="route-loading-page">
        <div className="route-loading-spinner" />
        <p>Checking recovery link...</p>
      </main>
    );
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
            Secure recovery
          </p>

          <h1>
            Create a new password for your account.
          </h1>

          <p>
            Choose a strong password to protect your
            LeadFlow workspace and business data.
          </p>

          <div className="auth-feature-list">
            <span>Minimum six characters</span>
            <span>Secure Supabase session</span>
            <span>Immediate account protection</span>
          </div>
        </div>

        <div className="auth-visual-footer">
          Your customer data remains protected.
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <p className="auth-eyebrow">
              New password
            </p>

            <h2>Choose a new password</h2>

            <p>
              Enter and confirm the password you want to
              use from now on.
            </p>
          </div>

          {!isRecoverySession && (
            <div className="auth-error">
              This recovery link is invalid or has expired.
              Request a new password reset email.
            </div>
          )}

          {errorMessage && (
            <div className="auth-error">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="auth-success">
              <CheckCircle2 size={17} />
              {successMessage}
            </div>
          )}

          {isRecoverySession ? (
            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <label>
                New password

                <div className="auth-input">
                  <LockKeyhole size={18} />

                  <input
                    required
                    minLength="6"
                    autoComplete="new-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
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

              <label>
                Confirm new password

                <div className="auth-input">
                  <LockKeyhole size={18} />

                  <input
                    required
                    minLength="6"
                    autoComplete="new-password"
                    name="confirmPassword"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Repeat your new password"
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                  />
                </div>
              </label>

              <button
                className="auth-submit-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Updating password..."
                  : "Update password"}
              </button>
            </form>
          ) : (
            <p className="auth-switch">
              <Link to="/forgot-password">
                Request another reset link
              </Link>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default ResetPassword;