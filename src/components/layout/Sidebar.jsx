import {
  BarChart3,
  CalendarDays,
  CheckSquare2,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Target,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Customers",
    path: "/customers",
    icon: UsersRound,
  },
  {
    label: "Leads",
    path: "/leads",
    icon: UserRoundPlus,
  },
  {
    label: "Pipeline",
    path: "/pipeline",
    icon: Target,
  },
  {
    label: "Tasks",
    path: "/tasks",
    icon: CheckSquare2,
  },
  {
    label: "Calendar",
    path: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function getInitials(name, email) {
  const source = name?.trim() || email?.trim() || "LeadFlow User";

  return source
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}) {
  const { user, signOut } = useAuth();

  const fullName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "LeadFlow User";

  const role =
    user?.user_metadata?.role || "Administrator";

  async function handleLogout() {
    await signOut();
  }

  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-mobile-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`app-sidebar ${
          collapsed ? "collapsed" : ""
        } ${mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="sidebar-logo">L</div>

            {!collapsed && (
              <div className="sidebar-brand-copy">
                <strong>LeadFlow</strong>
                <span>CRM</span>
              </div>
            )}
          </div>

          <button
            className="sidebar-collapse-button"
            type="button"
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            onClick={onToggle}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        </div>

        {!collapsed && (
          <div className="sidebar-workspace-card">
            <div className="workspace-icon">VF</div>

            <div>
              <span>Workspace</span>
              <strong>
                {user?.user_metadata?.company ||
                  "VectorForge Prime"}
              </strong>
            </div>
          </div>
        )}

        <nav className="sidebar-navigation">
          {!collapsed && (
            <p className="sidebar-section-label">
              Workspace
            </p>
          )}

          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
                end={item.path === "/"}
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
              >
                <span className="sidebar-link-icon">
                  <Icon size={19} strokeWidth={2} />
                </span>

                {!collapsed && (
                  <span className="sidebar-link-label">
                    {item.label}
                  </span>
                )}

                {!collapsed && (
                  <span className="sidebar-active-dot" />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          {!collapsed && (
            <div className="sidebar-help-card">
              <div className="sidebar-help-icon">
                <Target size={18} />
              </div>

              <div>
                <strong>Sales workspace</strong>
                <span>
                  Keep your pipeline moving forward.
                </span>
              </div>
            </div>
          )}

          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {getInitials(fullName, user?.email)}
            </div>

            {!collapsed && (
              <div className="sidebar-user-copy">
                <strong>{fullName}</strong>
                <span>{role}</span>
              </div>
            )}

            <button
              className="sidebar-logout-button"
              type="button"
              aria-label="Sign out"
              onClick={handleLogout}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;