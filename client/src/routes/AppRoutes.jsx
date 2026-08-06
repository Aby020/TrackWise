import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import { AppShell } from "../components/layout/AppShell";
import { PageLoader } from "../components/layout/PageLoader";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const Login = lazy(() => import("../pages/auth/Login"));
const ActivateAccount = lazy(() => import("../pages/auth/ActivateAccount"));
const EmployeeDashboard = lazy(() => import("../pages/employee/Dashboard"));
const AttendanceHistory = lazy(() =>
  import("../pages/employee/AttendanceHistory"),
);
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
const Employees = lazy(() => import("../pages/admin/Employees"));
const AddEmployee = lazy(() => import("../pages/admin/AddEmployee"));
const EditEmployee = lazy(() => import("../pages/admin/EditEmployee"));
const NotFound = lazy(() => import("../pages/error/NotFound"));

function EmployeeShell({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

function AdminShell({ children }) {
  return (
    <AdminRoute>
      <AppShell>{children}</AppShell>
    </AdminRoute>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/activate" element={<ActivateAccount />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <EmployeeShell>
                <EmployeeDashboard />
              </EmployeeShell>
            }
          />
          <Route
            path="/attendance-history"
            element={
              <EmployeeShell>
                <AttendanceHistory />
              </EmployeeShell>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminShell>
                <AdminDashboard />
              </AdminShell>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <AdminShell>
                <Employees />
              </AdminShell>
            }
          />
          <Route
            path="/admin/add-employee"
            element={
              <AdminShell>
                <AddEmployee />
              </AdminShell>
            }
          />
          <Route
            path="/admin/edit-employee/:employeeId"
            element={
              <AdminShell>
                <EditEmployee />
              </AdminShell>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
