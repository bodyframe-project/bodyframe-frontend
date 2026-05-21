import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { PublicLayout } from "../components/layout/PublicLayout";
import { PublicOnlyRoute } from "../components/layout/PublicOnlyRoute";
import { RoleGate } from "../components/layout/RoleGate";
import { useAuth } from "../context/AuthContext";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "../pages/auth/VerifyEmailPage";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage";
import { ChildDetailPage } from "../pages/user/ChildDetailPage";
import { ChildrenPage } from "../pages/user/ChildrenPage";
import { PatientDetailPage } from "../pages/doctor/PatientDetailPage";
import { PatientsPage } from "../pages/doctor/PatientsPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { FrameCalculatorPage } from "../pages/public/FrameCalculatorPage";
import { DashboardPage } from "../pages/user/DashboardPage";

function RootRedirect() {
  const { ready, isAuthenticated, session } = useAuth();

  if (!ready) {
    return <div className="screen-loader">Yukleniyor...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/calculator" replace />;
  }

  if (session?.role === "Admin") {
    return <Navigate to="/app/admin" replace />;
  }

  if (session?.role === "Doctor") {
    return <Navigate to="/app/patients" replace />;
  }

  return <Navigate to="/app" replace />;
}

function AppIndexPage() {
  const { session } = useAuth();

  if (session?.role === "Admin") {
    return <AdminUsersPage />;
  }

  if (session?.role === "Doctor") {
    return <Navigate to="/app/patients" replace />;
  }

  return <DashboardPage />;
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

      <Route path="/calculator" element={<FrameCalculatorPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AppIndexPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route
          path="children"
          element={
            <RoleGate roles={["User"]}>
              <ChildrenPage />
            </RoleGate>
          }
        />
        <Route
          path="children/:childId"
          element={
            <RoleGate roles={["User"]}>
              <ChildDetailPage />
            </RoleGate>
          }
        />
        <Route
          path="admin"
          element={
            <RoleGate roles={["Admin"]}>
              <AdminUsersPage />
            </RoleGate>
          }
        />
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
