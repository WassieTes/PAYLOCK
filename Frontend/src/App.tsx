import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DeveloperPage from "./pages/DeveloperPage";
import DemoStorePage from "./pages/DemoStorePage";
import UploadReceiptPage from "./pages/UploadReceiptPage";
import ReviewPage from "./pages/ReviewPage";
import SettingsPage from "./pages/SettingsPage";
import HistoryPage from "./pages/HistoryPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import DashboardRouteLayout from "./components/dashboard/DashboardRouteLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/*" element={<DashboardPage />} />
        <Route
          path="/developer"
          element={
            <DashboardRouteLayout>
              <DeveloperPage />
            </DashboardRouteLayout>
          }
        />
        <Route path="/demo-store" element={<DemoStorePage />} />
        <Route
          path="/dashboard/upload"
          element={
            <DashboardRouteLayout>
              <UploadReceiptPage />
            </DashboardRouteLayout>
          }
        />
        <Route
          path="/dashboard/history"
          element={
            <DashboardRouteLayout>
              <HistoryPage />
            </DashboardRouteLayout>
          }
        />
        <Route
          path="/dashboard/review"
          element={
            <DashboardRouteLayout>
              <ReviewPage />
            </DashboardRouteLayout>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <DashboardRouteLayout>
              <SettingsPage />
            </DashboardRouteLayout>
          }
        />
        <Route
          path="/dashboard/help"
          element={
            <DashboardRouteLayout>
              <HelpSupportPage />
            </DashboardRouteLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
