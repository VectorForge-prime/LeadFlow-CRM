import { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  Check,
  Globe2,
  LockKeyhole,
  Mail,
  Save,
  Settings2,
  ShieldCheck,
  User,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";

function Settings() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");

  const [profileData, setProfileData] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    role: "Administrator",
    website: "",
    timezone: "Europe/Bucharest",
    language: "English",
    currency: "USD",
    dateFormat: "DD/MM/YYYY",
    emailNotifications: true,
    taskReminders: true,
    leadUpdates: true,
    weeklyReports: false,
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] =
    useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    const metadata = user.user_metadata ?? {};

    setProfileData({
      fullName: metadata.full_name ?? "",
      company: metadata.company ?? "",
      email: user.email ?? "",
      phone: metadata.phone ?? "",
      role: metadata.role ?? "Administrator",
      website: metadata.website ?? "",
      timezone:
        metadata.timezone ?? "Europe/Bucharest",
      language: metadata.language ?? "English",
      currency: metadata.currency ?? "USD",
      dateFormat:
        metadata.date_format ?? "DD/MM/YYYY",
      emailNotifications:
        metadata.email_notifications ?? true,
      taskReminders:
        metadata.task_reminders ?? true,
      leadUpdates:
        metadata.lead_updates ?? true,
      weeklyReports:
        metadata.weekly_reports ?? false,
    });
  }, [user]);

  function handleProfileChange(event) {
    const { name, value, type, checked } =
      event.target;

    setProfileData((currentData) => ({
      ...currentData,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;

    setPasswordData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function clearMessages() {
    setSuccessMessage("");
    setErrorMessage("");
  }

  async function handleSaveProfile(event) {
    event.preventDefault();

    clearMessages();
    setIsSaving(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: profileData.fullName.trim(),
        company: profileData.company.trim(),
        phone: profileData.phone.trim(),
        role: profileData.role.trim(),
        website: profileData.website.trim(),
        timezone: profileData.timezone,
        language: profileData.language,
        currency: profileData.currency,
        date_format: profileData.dateFormat,
        email_notifications:
          profileData.emailNotifications,
        task_reminders: profileData.taskReminders,
        lead_updates: profileData.leadUpdates,
        weekly_reports: profileData.weeklyReports,
      },
    });

    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(
      "Settings saved successfully."
    );
  }

  async function handleChangePassword(event) {
    event.preventDefault();

    clearMessages();

    if (passwordData.newPassword.length < 6) {
      setErrorMessage(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsChangingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword,
    });

    setIsChangingPassword(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    });

    setSuccessMessage(
      "Password changed successfully."
    );
  }

  const initial =
    profileData.fullName.trim().charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <AppLayout>
      <section className="settings-page">
        <div className="settings-header">
          <div>
            <p className="page-eyebrow">
              Account configuration
            </p>

            <h1>Settings</h1>

            <p>
              Manage your profile, business preferences
              and account security.
            </p>
          </div>

          {activeTab !== "security" && (
            <button
              className="primary-button settings-save-button"
              type="submit"
              form="settings-profile-form"
              disabled={isSaving}
            >
              <Save size={18} />

              {isSaving
                ? "Saving..."
                : "Save changes"}
            </button>
          )}
        </div>

        {successMessage && (
          <div className="settings-success-message">
            <Check size={17} />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="settings-error-message">
            {errorMessage}
          </div>
        )}

        <section className="settings-layout">
          <aside className="settings-navigation">
            <button
              className={
                activeTab === "profile" ? "active" : ""
              }
              type="button"
              onClick={() => {
                clearMessages();
                setActiveTab("profile");
              }}
            >
              <User size={18} />
              Profile
            </button>

            <button
              className={
                activeTab === "business" ? "active" : ""
              }
              type="button"
              onClick={() => {
                clearMessages();
                setActiveTab("business");
              }}
            >
              <Building2 size={18} />
              Business
            </button>

            <button
              className={
                activeTab === "preferences"
                  ? "active"
                  : ""
              }
              type="button"
              onClick={() => {
                clearMessages();
                setActiveTab("preferences");
              }}
            >
              <Settings2 size={18} />
              Preferences
            </button>

            <button
              className={
                activeTab === "notifications"
                  ? "active"
                  : ""
              }
              type="button"
              onClick={() => {
                clearMessages();
                setActiveTab("notifications");
              }}
            >
              <Bell size={18} />
              Notifications
            </button>

            <button
              className={
                activeTab === "security" ? "active" : ""
              }
              type="button"
              onClick={() => {
                clearMessages();
                setActiveTab("security");
              }}
            >
              <LockKeyhole size={18} />
              Security
            </button>
          </aside>

          <div className="settings-content">
            <form
              id="settings-profile-form"
              onSubmit={handleSaveProfile}
            >
              {activeTab === "profile" && (
                <article className="settings-card">
                  <div className="settings-card-header">
                    <div>
                      <h2>Profile information</h2>

                      <p>
                        Update your personal details and
                        contact information.
                      </p>
                    </div>
                  </div>

                  <div className="settings-profile-summary">
                    <div className="settings-avatar">
                      {initial}
                    </div>

                    <div>
                      <strong>
                        {profileData.fullName ||
                          "LeadFlow User"}
                      </strong>

                      <span>{profileData.role}</span>
                    </div>
                  </div>

                  <div className="settings-form-grid">
                    <label>
                      Full name

                      <input
                        required
                        name="fullName"
                        type="text"
                        value={profileData.fullName}
                        onChange={handleProfileChange}
                      />
                    </label>

                    <label>
                      Role

                      <input
                        name="role"
                        type="text"
                        value={profileData.role}
                        onChange={handleProfileChange}
                      />
                    </label>

                    <label>
                      Email address

                      <input
                        disabled
                        name="email"
                        type="email"
                        value={profileData.email}
                      />

                      <small>
                        Email changes require a separate
                        confirmation process.
                      </small>
                    </label>

                    <label>
                      Phone number

                      <input
                        name="phone"
                        type="tel"
                        placeholder="+40 700 000 000"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                      />
                    </label>
                  </div>
                </article>
              )}

              {activeTab === "business" && (
                <article className="settings-card">
                  <div className="settings-card-header">
                    <div>
                      <h2>Business information</h2>

                      <p>
                        Configure the company details used
                        throughout the CRM.
                      </p>
                    </div>
                  </div>

                  <div className="settings-form-grid">
                    <label>
                      Company name

                      <input
                        name="company"
                        type="text"
                        value={profileData.company}
                        onChange={handleProfileChange}
                      />
                    </label>

                    <label>
                      Website

                      <div className="settings-input-with-icon">
                        <Globe2 size={16} />

                        <input
                          name="website"
                          type="url"
                          placeholder="https://company.com"
                          value={profileData.website}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </label>

                    <label>
                      Business email

                      <div className="settings-input-with-icon">
                        <Mail size={16} />

                        <input
                          disabled
                          type="email"
                          value={profileData.email}
                        />
                      </div>
                    </label>

                    <label>
                      Account identifier

                      <input
                        disabled
                        type="text"
                        value={user?.id ?? ""}
                      />
                    </label>
                  </div>
                </article>
              )}

              {activeTab === "preferences" && (
                <article className="settings-card">
                  <div className="settings-card-header">
                    <div>
                      <h2>Regional preferences</h2>

                      <p>
                        Set your language, timezone,
                        currency and date format.
                      </p>
                    </div>
                  </div>

                  <div className="settings-form-grid">
                    <label>
                      Timezone

                      <select
                        name="timezone"
                        value={profileData.timezone}
                        onChange={handleProfileChange}
                      >
                        <option value="Europe/Bucharest">
                          Europe/Bucharest
                        </option>

                        <option value="Europe/London">
                          Europe/London
                        </option>

                        <option value="America/New_York">
                          America/New_York
                        </option>

                        <option value="Asia/Dubai">
                          Asia/Dubai
                        </option>
                      </select>
                    </label>

                    <label>
                      Language

                      <select
                        name="language"
                        value={profileData.language}
                        onChange={handleProfileChange}
                      >
                        <option value="English">
                          English
                        </option>

                        <option value="Romanian">
                          Romanian
                        </option>

                        <option value="German">
                          German
                        </option>

                        <option value="French">
                          French
                        </option>
                      </select>
                    </label>

                    <label>
                      Currency

                      <select
                        name="currency"
                        value={profileData.currency}
                        onChange={handleProfileChange}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="RON">RON</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </label>

                    <label>
                      Date format

                      <select
                        name="dateFormat"
                        value={profileData.dateFormat}
                        onChange={handleProfileChange}
                      >
                        <option value="DD/MM/YYYY">
                          DD/MM/YYYY
                        </option>

                        <option value="MM/DD/YYYY">
                          MM/DD/YYYY
                        </option>

                        <option value="YYYY-MM-DD">
                          YYYY-MM-DD
                        </option>
                      </select>
                    </label>
                  </div>
                </article>
              )}

              {activeTab === "notifications" && (
                <article className="settings-card">
                  <div className="settings-card-header">
                    <div>
                      <h2>
                        Notification preferences
                      </h2>

                      <p>
                        Choose which updates and reminders
                        you want to receive.
                      </p>
                    </div>
                  </div>

                  <div className="settings-toggle-list">
                    <label className="settings-toggle-item">
                      <div>
                        <strong>
                          Email notifications
                        </strong>

                        <span>
                          Receive important CRM alerts by
                          email.
                        </span>
                      </div>

                      <input
                        name="emailNotifications"
                        type="checkbox"
                        checked={
                          profileData.emailNotifications
                        }
                        onChange={handleProfileChange}
                      />
                    </label>

                    <label className="settings-toggle-item">
                      <div>
                        <strong>Task reminders</strong>

                        <span>
                          Get reminded before task
                          deadlines.
                        </span>
                      </div>

                      <input
                        name="taskReminders"
                        type="checkbox"
                        checked={
                          profileData.taskReminders
                        }
                        onChange={handleProfileChange}
                      />
                    </label>

                    <label className="settings-toggle-item">
                      <div>
                        <strong>Lead updates</strong>

                        <span>
                          Receive alerts when lead stages
                          change.
                        </span>
                      </div>

                      <input
                        name="leadUpdates"
                        type="checkbox"
                        checked={profileData.leadUpdates}
                        onChange={handleProfileChange}
                      />
                    </label>

                    <label className="settings-toggle-item">
                      <div>
                        <strong>Weekly reports</strong>

                        <span>
                          Receive a weekly business
                          performance summary.
                        </span>
                      </div>

                      <input
                        name="weeklyReports"
                        type="checkbox"
                        checked={
                          profileData.weeklyReports
                        }
                        onChange={handleProfileChange}
                      />
                    </label>
                  </div>
                </article>
              )}
            </form>

            {activeTab === "security" && (
              <article className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Account security</h2>

                    <p>
                      Change your password and review your
                      authentication status.
                    </p>
                  </div>
                </div>

                <div className="settings-security-status">
                  <ShieldCheck size={24} />

                  <div>
                    <strong>
                      Email authentication active
                    </strong>

                    <span>{profileData.email}</span>
                  </div>
                </div>

                <form
                  className="settings-password-form"
                  onSubmit={handleChangePassword}
                >
                  <label>
                    New password

                    <input
                      required
                      minLength="6"
                      name="newPassword"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={
                        passwordData.newPassword
                      }
                      onChange={handlePasswordChange}
                    />
                  </label>

                  <label>
                    Confirm new password

                    <input
                      required
                      minLength="6"
                      name="confirmPassword"
                      type="password"
                      placeholder="Repeat the new password"
                      value={
                        passwordData.confirmPassword
                      }
                      onChange={handlePasswordChange}
                    />
                  </label>

                  <button
                    className="primary-button"
                    type="submit"
                    disabled={isChangingPassword}
                  >
                    <LockKeyhole size={17} />

                    {isChangingPassword
                      ? "Changing password..."
                      : "Change password"}
                  </button>
                </form>
              </article>
            )}
          </div>
        </section>
      </section>
    </AppLayout>
  );
}

export default Settings;