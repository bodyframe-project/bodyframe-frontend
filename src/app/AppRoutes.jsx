import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { PublicLayout } from "../components/layout/PublicLayout";
import { PublicOnlyRoute } from "../components/layout/PublicOnlyRoute";
import { RoleGate } from "../components/layout/RoleGate";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "../pages/auth/VerifyEmailPage";
import { DashboardPage } from "../pages/user/DashboardPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { PatientsPage } from "../pages/doctor/PatientsPage";
import { PatientDetailPage } from "../pages/doctor/PatientDetailPage";

function RootRedirect() {
  const { ready, isAuthenticated, session } = useAuth();

  if (!ready) {
    return <div className="screen-loader">Yukleniyor...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (session?.role === "Doctor") {
    return <Navigate to="/app/patients" replace />;
  }

  return <Navigate to="/app" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        element={
          <PublicOnlyRoute>
            <PublicLayout />
          </PublicOnlyRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route
          path="patients"
          element={
            <RoleGate roles={["Doctor"]}>
              <PatientsPage />
            </RoleGate>
          }
        />
        <Route
          path="patients/:patientId"
          element={
            <RoleGate roles={["Doctor"]}>
              <PatientDetailPage />
            </RoleGate>
          }
        />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
