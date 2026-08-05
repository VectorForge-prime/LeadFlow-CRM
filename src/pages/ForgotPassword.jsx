import { useState } from "react";
import {
  ArrowLeft,
  Mail,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../services/supabase";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(
      "Password reset email sent. Check your inbox and follow the link."
    );
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
            Account recovery
          </p>

          <h1>
            Recover access to your LeadFlow workspace.
          </h1>

          <p>
            Enter your account email and we will send you
            a secure password reset link.
          </p>

          <div className="auth-feature-list">
            <span>Secure recovery link</span>
            <span>Protected Supabase authentication</span>
            <span>Quick access restoration</span>
          </div>
        </div>

        <div className="auth-visual-footer">
          Secure account recovery powered by Supabase.
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
              Forgot password
            </p>

            <h2>Reset your password</h2>

            <p>
              We will send a recovery link to your email
              address.
            </p>
          </div>

          {errorMessage && (
            <div className="auth-error">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="auth-success">
              {successMessage}
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
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                />
              </div>
            </label>

            <button
              className="auth-submit-button"
              type="submit"
              disabled={isSubmitting}
            >
              <Send size={17} />

              {isSubmitting
                ? "Sending link..."
                : "Send reset link"}
            </button>
          </form>

          <Link
            className="auth-back-link"
            to="/login"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </Link>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;