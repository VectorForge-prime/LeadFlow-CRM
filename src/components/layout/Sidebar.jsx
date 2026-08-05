import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Customers",
    path: "/customers",
    icon: Users,
  },
  {
    name: "Leads",
    path: "/leads",
    icon: UserPlus,
  },
  {
    name: "Pipeline",
    path: "/pipeline",
    icon: KanbanSquare,
  },
  {
    name: "Tasks",
    path: "/tasks",
    icon: CheckSquare,
  },
  {
    name: "Calendar",
    path: "/calendar",
    icon: CalendarDays,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "LeadFlow User";

  const initial = displayName
    .trim()
    .charAt(0)
    .toUpperCase();

  async function handleLogout() {
    const { error } = await signOut();

    if (error) {
      console.error("Logout error:", error.message);
      return;
    }

    navigate("/login", { replace: true });
  }

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">L</div>

        <div className="logo-text">
          <h2>LeadFlow</h2>
          <span>CRM</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <Icon size={20} strokeWidth={2} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{initial}</div>

          <div className="sidebar-user-info">
            <strong>{displayName}</strong>
            <span>Administrator</span>
          </div>
        </div>

        <button
          className="sidebar-logout-button"
          type="button"
          aria-label="Log out"
          title="Log out"
          onClick={handleLogout}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;