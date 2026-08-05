import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <main className="route-loading-page">
        <div className="route-loading-spinner" />
        <p>Loading...</p>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;