import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  return (
    <div
      className={`app-shell ${
        sidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() =>
          setMobileSidebarOpen(false)
        }
        onToggle={() =>
          setSidebarCollapsed(
            (currentValue) => !currentValue
          )
        }
      />

      <div className="app-main">
        <Topbar
          onOpenMobile={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="app-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;