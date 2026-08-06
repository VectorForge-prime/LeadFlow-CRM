import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Building2,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";

const defaultProfile = {
  fullName: "",
  role: "",
  phone: "",
};

const defaultBusiness = {
  company: "",
  industry: "",
  website: "",
  currency: "USD",
};

const defaultPreferences = {
  language: "English",
  dateFormat: "MM/DD/YYYY",
  startOfWeek: "Monday",
  compactMode: false,
};

const defaultNotifications = {
  newLeads: true,
  taskReminders: true,
  calendarReminders: true,
  weeklySummary: false,
};

const settingsTabs = [
  {
    id: "profile",
    label: "Profile",
    description: "Personal information",
    icon: UserRound,
  },
  {
    id: "business",
    label: "Business",
    description: "Company information",
    icon: Building2,
  },
  {
    id: "preferences",
    label: "Preferences",
    description: "Workspace appearance",
    icon: SlidersHorizontal,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alerts and reminders",
    icon: Bell,
  },
  {
    id: "security",
    label: "Security",
    description: "Password and protection",
    icon: LockKeyhole,
  },
];

function Settings() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] =
    useState("profile");

  const [profile, setProfile] =
    useState(defaultProfile);

  const [business, setBusiness] =
    useState(defaultBusiness);

  const [preferences, setPreferences] =
    useState(defaultPreferences);

  const [notifications, setNotifications] =
    useState(defaultNotifications);

  const [passwordForm, setPasswordForm] =
    useState({
      password: "",
      confirmPassword: "",
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const metadata =
      user.user_metadata || {};

    setProfile({
      fullName:
        metadata.full_name || "",
      role:
        metadata.role ||
        "Administrator",
      phone:
        metadata.phone || "",
    });

    setBusiness({
      company:
        metadata.company || "",
      industry:
        metadata.industry || "",
      website:
        metadata.website || "",
      currency:
        metadata.currency || "USD",
    });

    setPreferences({
      language:
        metadata.language || "English",
      dateFormat:
        metadata.date_format ||
        "MM/DD/YYYY",
      startOfWeek:
        metadata.start_of_week ||
        "Monday",
      compactMode:
        metadata.compact_mode ?? false,
    });

    setNotifications({
      newLeads:
        metadata.notify_new_leads ??
        true,
      taskReminders:
        metadata.notify_tasks ?? true,
      calendarReminders:
        metadata.notify_calendar ??
        true,
      weeklySummary:
        metadata.weekly_summary ??
        false,
    });
  }, [user]);

  const displayName =
    profile.fullName ||
    user?.email?.split("@")[0] ||
    "LeadFlow User";

  const initials = useMemo(() => {
    return displayName
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [displayName]);

  function showMessage(type, text) {
    setMessage({
      type,
      text,
    });

    window.setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
    }, 4000);
  }

  function handleProfileChange(event) {
    const { name, value } =
      event.target;

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));
  }

  function handleBusinessChange(event) {
    const { name, value } =
      event.target;

    setBusiness((currentBusiness) => ({
      ...currentBusiness,
      [name]: value,
    }));
  }

  function handlePreferenceChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setPreferences(
      (currentPreferences) => ({
        ...currentPreferences,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
  }

  function handleNotificationChange(
    event
  ) {
    const { name, checked } =
      event.target;

    setNotifications(
      (currentNotifications) => ({
        ...currentNotifications,
        [name]: checked,
      })
    );
  }

  function handlePasswordChange(event) {
    const { name, value } =
      event.target;

    setPasswordForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function updateMetadata(
    metadata,
    successMessage
  ) {
    setIsSaving(true);
    setMessage({
      type: "",
      text: "",
    });

    const { error } =
      await supabase.auth.updateUser({
        data: metadata,
      });

    setIsSaving(false);

    if (error) {
      showMessage(
        "error",
        error.message
      );

      return;
    }

    showMessage(
      "success",
      successMessage
    );
  }

  async function handleProfileSubmit(
    event
  ) {
    event.preventDefault();

    await updateMetadata(
      {
        full_name:
          profile.fullName.trim(),
        role: profile.role.trim(),
        phone: profile.phone.trim(),
      },
      "Profile information was saved."
    );
  }

  async function handleBusinessSubmit(
    event
  ) {
    event.preventDefault();

    await updateMetadata(
      {
        company:
          business.company.trim(),
        industry:
          business.industry.trim(),
        website:
          business.website.trim(),
        currency:
          business.currency,
      },
      "Business information was saved."
    );
  }

  async function handlePreferencesSubmit(
    event
  ) {
    event.preventDefault();

    await updateMetadata(
      {
        language:
          preferences.language,
        date_format:
          preferences.dateFormat,
        start_of_week:
          preferences.startOfWeek,
        compact_mode:
          preferences.compactMode,
      },
      "Workspace preferences were saved."
    );
  }

  async function handleNotificationsSubmit(
    event
  ) {
    event.preventDefault();

    await updateMetadata(
      {
        notify_new_leads:
          notifications.newLeads,
        notify_tasks:
          notifications.taskReminders,
        notify_calendar:
          notifications.calendarReminders,
        weekly_summary:
          notifications.weeklySummary,
      },
      "Notification preferences were saved."
    );
  }

  async function handlePasswordSubmit(
    event
  ) {
    event.preventDefault();

    if (
      passwordForm.password.length < 6
    ) {
      showMessage(
        "error",
        "Password must contain at least 6 characters."
      );

      return;
    }

    if (
      passwordForm.password !==
      passwordForm.confirmPassword
    ) {
      showMessage(
        "error",
        "Passwords do not match."
      );

      return;
    }

    setIsSaving(true);

    const { error } =
      await supabase.auth.updateUser({
        password:
          passwordForm.password,
      });

    setIsSaving(false);

    if (error) {
      showMessage(
        "error",
        error.message
      );

      return;
    }

    setPasswordForm({
      password: "",
      confirmPassword: "",
    });

    showMessage(
      "success",
      "Password was updated successfully."
    );
  }

  return (
    <AppLayout>
      <section className="settings-page">
        <header className="settings-header">
          <div>
            <p className="page-eyebrow">
              Account configuration
            </p>

            <h1>Settings</h1>

            <p>
              Manage your profile,
              business preferences and
              account security.
            </p>
          </div>

          <div className="settings-status-card">
            <ShieldCheck size={20} />

            <div>
              <span>Account status</span>
              <strong>Protected</strong>
            </div>
          </div>
        </header>

        {message.text && (
          <div
            className={`settings-message ${message.type}`}
          >
            {message.type ===
            "success" ? (
              <Check size={17} />
            ) : (
              <ShieldCheck size={17} />
            )}

            <span>{message.text}</span>
          </div>
        )}

        <div className="settings-main-grid">
          <aside className="settings-sidebar-card">
            <div className="settings-user-preview">
              <div className="settings-user-avatar">
                {initials}
              </div>

              <div>
                <strong>
                  {displayName}
                </strong>

                <span>
                  {user?.email ||
                    "No email"}
                </span>
              </div>
            </div>

            <nav className="settings-tabs">
              {settingsTabs.map(
                (tab) => {
                  const Icon = tab.icon;

                  return (
                    <button
                      className={
                        activeTab ===
                        tab.id
                          ? "active"
                          : ""
                      }
                      type="button"
                      key={tab.id}
                      onClick={() =>
                        setActiveTab(
                          tab.id
                        )
                      }
                    >
                      <span className="settings-tab-icon">
                        <Icon size={18} />
                      </span>

                      <span className="settings-tab-copy">
                        <strong>
                          {tab.label}
                        </strong>

                        <small>
                          {
                            tab.description
                          }
                        </small>
                      </span>
                    </button>
                  );
                }
              )}
            </nav>

            <div className="settings-security-info">
              <ShieldCheck size={20} />

              <div>
                <strong>
                  Secure account
                </strong>

                <span>
                  Protected by Supabase
                  Authentication.
                </span>
              </div>
            </div>
          </aside>

          <main className="settings-content-card">
            {activeTab ===
              "profile" && (
              <>
                <div className="settings-panel-header">
                  <div>
                    <span>
                      Personal details
                    </span>

                    <h2>
                      Profile information
                    </h2>

                    <p>
                      Update your personal
                      details and contact
                      information.
                    </p>
                  </div>

                  <div className="settings-panel-header-icon">
                    <UserRound
                      size={22}
                    />
                  </div>
                </div>

                <form
                  className="settings-form"
                  onSubmit={
                    handleProfileSubmit
                  }
                >
                  <div className="settings-profile-preview">
                    <div className="settings-large-avatar">
                      {initials}
                    </div>

                    <div>
                      <strong>
                        {displayName}
                      </strong>

                      <span>
                        {profile.role ||
                          "Administrator"}
                      </span>

                      <small>
                        {business.company ||
                          "LeadFlow workspace"}
                      </small>
                    </div>
                  </div>

                  <div className="settings-form-grid">
                    <label>
                      Full name

                      <div className="settings-input">
                        <UserRound
                          size={18}
                        />

                        <input
                          required
                          name="fullName"
                          type="text"
                          placeholder="Your full name"
                          value={
                            profile.fullName
                          }
                          onChange={
                            handleProfileChange
                          }
                        />
                      </div>
                    </label>

                    <label>
                      Role

                      <div className="settings-input">
                        <ShieldCheck
                          size={18}
                        />

                        <input
                          name="role"
                          type="text"
                          placeholder="Administrator"
                          value={
                            profile.role
                          }
                          onChange={
                            handleProfileChange
                          }
                        />
                      </div>
                    </label>

                    <label>
                      Email address

                      <div className="settings-input disabled">
                        <Mail size={18} />

                        <input
                          disabled
                          type="email"
                          value={
                            user?.email ||
                            ""
                          }
                        />
                      </div>

                      <small className="settings-field-help">
                        Email changes require
                        separate confirmation.
                      </small>
                    </label>

                    <label>
                      Phone number

                      <div className="settings-input">
                        <Settings2
                          size={18}
                        />

                        <input
                          name="phone"
                          type="tel"
                          placeholder="+40 700 000 000"
                          value={
                            profile.phone
                          }
                          onChange={
                            handleProfileChange
                          }
                        />
                      </div>
                    </label>
                  </div>

                  <div className="settings-form-footer">
                    <span>
                      Changes are saved to
                      your account metadata.
                    </span>

                    <button
                      className="settings-save-button"
                      type="submit"
                      disabled={isSaving}
                    >
                      <Save size={17} />

                      {isSaving
                        ? "Saving..."
                        : "Save changes"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab ===
              "business" && (
              <>
                <div className="settings-panel-header">
                  <div>
                    <span>
                      Workspace details
                    </span>

                    <h2>
                      Business information
                    </h2>

                    <p>
                      Configure your company
                      and sales workspace.
                    </p>
                  </div>

                  <div className="settings-panel-header-icon purple">
                    <Building2
                      size={22}
                    />
                  </div>
                </div>

                <form
                  className="settings-form"
                  onSubmit={
                    handleBusinessSubmit
                  }
                >
                  <div className="settings-form-grid">
                    <label>
                      Company name

                      <div className="settings-input">
                        <Building2
                          size={18}
                        />

                        <input
                          name="company"
                          type="text"
                          placeholder="Company name"
                          value={
                            business.company
                          }
                          onChange={
                            handleBusinessChange
                          }
                        />
                      </div>
                    </label>

                    <label>
                      Industry

                      <div className="settings-input">
                        <Settings2
                          size={18}
                        />

                        <input
                          name="industry"
                          type="text"
                          placeholder="Software, retail..."
                          value={
                            business.industry
                          }
                          onChange={
                            handleBusinessChange
                          }
                        />
                      </div>
                    </label>

                    <label>
                      Website

                      <div className="settings-input">
                        <Mail size={18} />

                        <input
                          name="website"
                          type="url"
                          placeholder="https://company.com"
                          value={
                            business.website
                          }
                          onChange={
                            handleBusinessChange
                          }
                        />
                      </div>
                    </label>

                    <label>
                      Default currency

                      <div className="settings-input">
                        <Settings2
                          size={18}
                        />

                        <select
                          name="currency"
                          value={
                            business.currency
                          }
                          onChange={
                            handleBusinessChange
                          }
                        >
                          <option value="USD">
                            USD
                          </option>

                          <option value="EUR">
                            EUR
                          </option>

                          <option value="RON">
                            RON
                          </option>

                          <option value="GBP">
                            GBP
                          </option>
                        </select>
                      </div>
                    </label>
                  </div>

                  <div className="settings-form-footer">
                    <span>
                      These details identify
                      your CRM workspace.
                    </span>

                    <button
                      className="settings-save-button"
                      type="submit"
                      disabled={isSaving}
                    >
                      <Save size={17} />

                      {isSaving
                        ? "Saving..."
                        : "Save business"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab ===
              "preferences" && (
              <>
                <div className="settings-panel-header">
                  <div>
                    <span>
                      Workspace behavior
                    </span>

                    <h2>
                      Preferences
                    </h2>

                    <p>
                      Customize language,
                      dates and interface
                      behavior.
                    </p>
                  </div>

                  <div className="settings-panel-header-icon orange">
                    <SlidersHorizontal
                      size={22}
                    />
                  </div>
                </div>

                <form
                  className="settings-form"
                  onSubmit={
                    handlePreferencesSubmit
                  }
                >
                  <div className="settings-form-grid">
                    <label>
                      Language

                      <div className="settings-input">
                        <Settings2
                          size={18}
                        />

                        <select
                          name="language"
                          value={
                            preferences.language
                          }
                          onChange={
                            handlePreferenceChange
                          }
                        >
                          <option value="English">
                            English
                          </option>

                          <option value="Romanian">
                            Romanian
                          </option>
                        </select>
                      </div>
                    </label>

                    <label>
                      Date format

                      <div className="settings-input">
                        <Settings2
                          size={18}
                        />

                        <select
                          name="dateFormat"
                          value={
                            preferences.dateFormat
                          }
                          onChange={
                            handlePreferenceChange
                          }
                        >
                          <option value="MM/DD/YYYY">
                            MM/DD/YYYY
                          </option>

                          <option value="DD/MM/YYYY">
                            DD/MM/YYYY
                          </option>

                          <option value="YYYY-MM-DD">
                            YYYY-MM-DD
                          </option>
                        </select>
                      </div>
                    </label>

                    <label>
                      Week starts on

                      <div className="settings-input">
                        <Settings2
                          size={18}
                        />

                        <select
                          name="startOfWeek"
                          value={
                            preferences.startOfWeek
                          }
                          onChange={
                            handlePreferenceChange
                          }
                        >
                          <option value="Monday">
                            Monday
                          </option>

                          <option value="Sunday">
                            Sunday
                          </option>
                        </select>
                      </div>
                    </label>
                  </div>

                  <label className="settings-switch-row">
                    <div>
                      <strong>
                        Compact interface
                      </strong>

                      <span>
                        Reduce spacing in
                        tables and lists.
                      </span>
                    </div>

                    <input
                      checked={
                        preferences.compactMode
                      }
                      name="compactMode"
                      type="checkbox"
                      onChange={
                        handlePreferenceChange
                      }
                    />

                    <span className="settings-switch" />
                  </label>

                  <div className="settings-form-footer">
                    <span>
                      Preferences apply to
                      your user account.
                    </span>

                    <button
                      className="settings-save-button"
                      type="submit"
                      disabled={isSaving}
                    >
                      <Save size={17} />

                      {isSaving
                        ? "Saving..."
                        : "Save preferences"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab ===
              "notifications" && (
              <>
                <div className="settings-panel-header">
                  <div>
                    <span>
                      Alerts and reminders
                    </span>

                    <h2>
                      Notifications
                    </h2>

                    <p>
                      Choose which CRM
                      activities should notify
                      you.
                    </p>
                  </div>

                  <div className="settings-panel-header-icon purple">
                    <Bell size={22} />
                  </div>
                </div>

                <form
                  className="settings-form"
                  onSubmit={
                    handleNotificationsSubmit
                  }
                >
                  <div className="settings-option-list">
                    <NotificationOption
                      checked={
                        notifications.newLeads
                      }
                      description="Receive an alert when a new lead is added."
                      label="New lead alerts"
                      name="newLeads"
                      onChange={
                        handleNotificationChange
                      }
                    />

                    <NotificationOption
                      checked={
                        notifications.taskReminders
                      }
                      description="Receive reminders for pending and overdue tasks."
                      label="Task reminders"
                      name="taskReminders"
                      onChange={
                        handleNotificationChange
                      }
                    />

                    <NotificationOption
                      checked={
                        notifications.calendarReminders
                      }
                      description="Receive reminders before scheduled events."
                      label="Calendar reminders"
                      name="calendarReminders"
                      onChange={
                        handleNotificationChange
                      }
                    />

                    <NotificationOption
                      checked={
                        notifications.weeklySummary
                      }
                      description="Receive a weekly CRM activity summary."
                      label="Weekly summary"
                      name="weeklySummary"
                      onChange={
                        handleNotificationChange
                      }
                    />
                  </div>

                  <div className="settings-form-footer">
                    <span>
                      Notification settings
                      are stored in your
                      account.
                    </span>

                    <button
                      className="settings-save-button"
                      type="submit"
                      disabled={isSaving}
                    >
                      <Save size={17} />

                      {isSaving
                        ? "Saving..."
                        : "Save notifications"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab ===
              "security" && (
              <>
                <div className="settings-panel-header">
                  <div>
                    <span>
                      Account protection
                    </span>

                    <h2>
                      Security
                    </h2>

                    <p>
                      Change your password
                      and protect your CRM
                      account.
                    </p>
                  </div>

                  <div className="settings-panel-header-icon green">
                    <LockKeyhole
                      size={22}
                    />
                  </div>
                </div>

                <div className="settings-protection-banner">
                  <ShieldCheck
                    size={23}
                  />

                  <div>
                    <strong>
                      Your account is
                      protected
                    </strong>

                    <span>
                      Authentication and
                      sessions are managed by
                      Supabase.
                    </span>
                  </div>

                  <small>Secure</small>
                </div>

                <form
                  className="settings-form"
                  onSubmit={
                    handlePasswordSubmit
                  }
                >
                  <div className="settings-form-grid">
                    <label>
                      New password

                      <div className="settings-input">
                        <LockKeyhole
                          size={18}
                        />

                        <input
                          required
                          minLength="6"
                          name="password"
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          placeholder="Minimum 6 characters"
                          value={
                            passwordForm.password
                          }
                          onChange={
                            handlePasswordChange
                          }
                        />

                        <button
                          className="settings-password-button"
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (value) =>
                                !value
                            )
                          }
                        >
                          {showPassword ? (
                            <EyeOff
                              size={17}
                            />
                          ) : (
                            <Eye
                              size={17}
                            />
                          )}
                        </button>
                      </div>
                    </label>

                    <label>
                      Confirm password

                      <div className="settings-input">
                        <LockKeyhole
                          size={18}
                        />

                        <input
                          required
                          minLength="6"
                          name="confirmPassword"
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          placeholder="Repeat password"
                          value={
                            passwordForm.confirmPassword
                          }
                          onChange={
                            handlePasswordChange
                          }
                        />

                        <button
                          className="settings-password-button"
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              (value) =>
                                !value
                            )
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff
                              size={17}
                            />
                          ) : (
                            <Eye
                              size={17}
                            />
                          )}
                        </button>
                      </div>
                    </label>
                  </div>

                  <div className="settings-password-note">
                    <ShieldCheck
                      size={18}
                    />

                    <span>
                      Use a long password with
                      letters, numbers and
                      symbols.
                    </span>
                  </div>

                  <div className="settings-form-footer">
                    <span>
                      The new password will
                      apply at your next login.
                    </span>

                    <button
                      className="settings-save-button"
                      type="submit"
                      disabled={isSaving}
                    >
                      <LockKeyhole
                        size={17}
                      />

                      {isSaving
                        ? "Updating..."
                        : "Update password"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </main>
        </div>
      </section>
    </AppLayout>
  );
}

function NotificationOption({
  name,
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <label className="settings-switch-row">
      <div>
        <strong>{label}</strong>
        <span>{description}</span>
      </div>

      <input
        checked={checked}
        name={name}
        type="checkbox"
        onChange={onChange}
      />

      <span className="settings-switch" />
    </label>
  );
}

export default Settings;