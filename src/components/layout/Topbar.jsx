import { Bell, Search } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function Topbar() {
  const { user } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "LeadFlow User";

  const initial = displayName
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={19} />

        <input
          type="search"
          placeholder="Search customers, leads or tasks..."
          aria-label="Global search"
        />
      </div>

      <div className="topbar-actions">
        <button
          className="icon-button"
          type="button"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        <div className="topbar-user">
          <div className="topbar-avatar">
            {initial}
          </div>

          <div className="topbar-user-info">
            <strong>{displayName}</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;