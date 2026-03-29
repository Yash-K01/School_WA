import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { Screening } from "./pages/Screening";
import { OffersSeats } from "./pages/OffersSeats";
import { FeesPayments } from "./pages/FeesPayments";
import { Enrollment } from "./pages/Enrollment";
import { Reports } from "./pages/Reports";
import { Security } from "./pages/Security";
import { Settings } from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/add" element={<AddLead />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="communication" element={<Communication />} />
          <Route path="counseling" element={<Counseling />} />
          <Route path="counseling/schedule-visit" element={<ScheduleVisit />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/create" element={<CreateApplication />} />
          <Route path="applications/new" element={<NewApplication />} />
          <Route path="screening" element={<Screening />} />
          <Route path="offers-seats" element={<OffersSeats />} />
          <Route path="fees-payments" element={<FeesPayments />} />
          <Route path="enrollment" element={<Enrollment />} />
          <Route path="reports" element={<Reports />} />
          <Route path="security" element={<Security />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}