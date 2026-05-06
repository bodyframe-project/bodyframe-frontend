import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function RoleGate({ roles, children }) {
  const { profile, session } = useAuth();
  const role = profile?.role ?? session?.role;

  if (!roles.includes(role)) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
