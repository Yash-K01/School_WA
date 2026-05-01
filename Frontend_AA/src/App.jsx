import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Leads } from "./pages/Leads";
import { AddLead } from "./pages/AddLead";
import { Pipeline } from "./pages/Pipeline";
import { Communication } from "./pages/Communication";
import { Counseling } from "./pages/Counseling";
import { ScheduleVisit } from "./pages/ScheduleVisit";
import { Applications } from "./pages/Applications";
import { CreateApplication } from "./pages/CreateApplication";
import { NewApplication } from "./pages/NewApplication";
import { MultiStepApplication } from "./pages/MultiStepApplication";
import { Screening } from "./pages/Screening";
import { OffersSeats } from "./pages/OffersSeats";
import { FeesPayments } from "./pages/FeesPayments";
import { Enrollment } from "./pages/Enrollment";
import { Reports } from "./pages/Reports";
import { Security } from "./pages/Security";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { AdminPortal } from "./pages/AdminPortal";
import { isAuthenticated, getUserData } from "./utils/authToken.js";

// Protected route component - redirects to login if not authenticated
function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// Admin protected route component - redirects to dashboard if not admin
function AdminProtectedRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const user = getUserData();
  if (user && (user.role === 'admin' || user.role === 'super_admin')) {
    return children;
  }
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/add" element={<AddLead />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="communication" element={<Communication />} />
          <Route path="counseling" element={<Counseling />} />
          <Route path="counseling/schedule-visit" element={<ScheduleVisit />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/create" element={<CreateApplication />} />
          <Route
            path="applications/form/:id"
            element={<MultiStepApplication />}
          />
          <Route path="application/:id" element={<MultiStepApplication />} />
          <Route path="applications/new" element={<NewApplication />} />
          <Route path="screening" element={<Screening />} />
          <Route path="offers-seats" element={<OffersSeats />} />
          <Route path="fees-payments" element={<FeesPayments />} />
          <Route path="enrollment" element={<Enrollment />} />
          <Route path="reports" element={<Reports />} />
          <Route path="security" element={<Security />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={
            <AdminProtectedRoute>
              <AdminPortal />
            </AdminProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
