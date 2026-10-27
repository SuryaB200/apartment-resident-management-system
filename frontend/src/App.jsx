import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BuildingsFlatsPage from './pages/BuildingsFlatsPage';
import ResidentsPage from './pages/ResidentsPage';
import OccupancyHistoryPage from './pages/OccupancyHistoryPage';
import MaintenanceBillingPage from './pages/MaintenanceBillingPage';
import PaymentsReceiptsPage from './pages/PaymentsReceiptsPage';
import OutstandingDuesPage from './pages/OutstandingDuesPage';
import ServiceTicketsPage from './pages/ServiceTicketsPage';
import StaffManagementPage from './pages/StaffManagementPage';
import VisitorsGatePage from './pages/VisitorsGatePage';
import AmenitiesPage from './pages/AmenitiesPage';
import ParkingPage from './pages/ParkingPage';
import ReportsPage from './pages/ReportsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';
import ProjectOverviewPage from './pages/ProjectOverviewPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
            Verifying Session & ACID Permissions...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Shell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="flats-buildings" element={<BuildingsFlatsPage />} />
            <Route path="residents" element={<ResidentsPage />} />
            <Route path="occupancy-history" element={<OccupancyHistoryPage />} />
            <Route path="maintenance-billing" element={<MaintenanceBillingPage />} />
            <Route path="payments-receipts" element={<PaymentsReceiptsPage />} />
            <Route path="outstanding-dues" element={<OutstandingDuesPage />} />
            <Route path="service-tickets" element={<ServiceTicketsPage />} />
            <Route path="staff-management" element={<StaffManagementPage />} />
            <Route path="visitors-gate-logs" element={<VisitorsGatePage />} />
            <Route path="amenities-bookings" element={<AmenitiesPage />} />
            <Route path="parking-management" element={<ParkingPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="user-management" element={<UserManagementPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="project-overview" element={<ProjectOverviewPage />} />
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
