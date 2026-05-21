import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function PublicOnlyRoute({ children }) {
  const { ready, isAuthenticated, session } = useAuth();

  if (!ready) {
    return <div className="screen-loader">Yukleniyor...</div>;
  }

  if (isAuthenticated) {
    if (session?.role === "Admin") {
      return <Navigate to="/app/admin" replace />;
    }

    if (session?.role === "Doctor") {
      return <Navigate to="/app/patients" replace />;
    }

    return <Navigate to="/app" replace />;
  }

  return children;
}
