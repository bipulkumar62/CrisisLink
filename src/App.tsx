import React, { useState } from 'react';
import { RoutePath } from '@/src/config/constants';
import { AuthProvider } from '@/src/context/AuthContext';
import { EmergencyDataProvider } from '@/src/context/EmergencyDataContext';
import { TopNavBar } from '@/src/components/layout/TopNavBar';
import { SideNavBar } from '@/src/components/layout/SideNavBar';
import { Footer } from '@/src/components/layout/Footer';

// Citizen Portal Pages
import { LandingPage } from '@/src/pages/citizen/LandingPage';
import { ReportEmergencyPage } from '@/src/pages/citizen/ReportEmergencyPage';
import { LiveIncidentsPage } from '@/src/pages/citizen/LiveIncidentsPage';
import { PublicIncidentDetailPage } from '@/src/pages/citizen/PublicIncidentDetailPage';
import { ReportConfirmationPage } from '@/src/pages/citizen/ReportConfirmationPage';
import { PublicSystemStatusPage } from '@/src/pages/citizen/PublicSystemStatusPage';

// Command Center Pages
import { AdminLoginPage } from '@/src/pages/command/AdminLoginPage';
import { DashboardPage } from '@/src/pages/command/DashboardPage';
import { IncidentsPage } from '@/src/pages/command/IncidentsPage';
import { IncidentDetailPage } from '@/src/pages/command/IncidentDetailPage';
import { ReportsPage } from '@/src/pages/command/ReportsPage';
import { ResourcesPage } from '@/src/pages/command/ResourcesPage';
import { OperationalMapPage } from '@/src/pages/command/OperationalMapPage';
import { SystemStatusPage } from '@/src/pages/command/SystemStatusPage';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<RoutePath>('command-dashboard');
  const [selectedIncidentCode, setSelectedIncidentCode] = useState<string>('CL-102');
  const [activeTrackingToken, setActiveTrackingToken] = useState<string>('CR-89241');

  const isCommandRoute = currentRoute.startsWith('command-') && currentRoute !== 'command-login';
  const isDashboardOrMap = currentRoute === 'command-dashboard' || currentRoute === 'command-map';

  const handleNavigate = (route: RoutePath) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectIncident = (code: string) => {
    setSelectedIncidentCode(code);
  };

  const handleReportSubmitted = (trackingToken: string) => {
    setActiveTrackingToken(trackingToken);
  };

  return (
    <div className={`${isDashboardOrMap ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'} flex flex-col bg-[#fbf9fb] text-[#1b1c1d] font-sans antialiased relative`}>
      {/* Universal Top Navigation */}
      <TopNavBar currentRoute={currentRoute} onNavigate={handleNavigate} />

      {/* Main Container Layout */}
      <div className={`flex-1 flex pt-[68px] ${isDashboardOrMap ? 'h-full' : ''}`}>
        {/* Command Center Operational Sidebar */}
        {isCommandRoute && (
          <SideNavBar currentRoute={currentRoute} onNavigate={handleNavigate} />
        )}

        {/* Page Content Viewport */}
        <main
          className={`flex-1 flex flex-col min-w-0 ${isDashboardOrMap ? 'overflow-hidden h-full' : 'px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full'}`}
        >
          {/* CITIZEN PORTAL ROUTES */}
          {currentRoute === 'citizen-landing' && (
            <LandingPage
              onNavigate={handleNavigate}
              onSelectIncident={handleSelectIncident}
            />
          )}

          {currentRoute === 'citizen-report' && (
            <ReportEmergencyPage
              onNavigate={handleNavigate}
              onReportSubmitted={handleReportSubmitted}
            />
          )}

          {currentRoute === 'citizen-live' && (
            <LiveIncidentsPage
              onNavigate={handleNavigate}
              onSelectIncident={handleSelectIncident}
            />
          )}

          {currentRoute === 'citizen-incident-detail' && (
            <PublicIncidentDetailPage
              incidentCode={selectedIncidentCode}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === 'citizen-confirmation' && (
            <ReportConfirmationPage
              trackingToken={activeTrackingToken}
              onNavigate={handleNavigate}
              onSelectIncident={handleSelectIncident}
            />
          )}

          {currentRoute === 'citizen-status' && (
            <PublicSystemStatusPage onNavigate={handleNavigate} />
          )}

          {/* COMMAND CENTER ROUTES */}
          {currentRoute === 'command-login' && (
            <AdminLoginPage onNavigate={handleNavigate} />
          )}

          {currentRoute === 'command-dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              onSelectIncidentDetail={handleSelectIncident}
            />
          )}

          {currentRoute === 'command-incidents' && (
            <IncidentsPage
              onNavigate={handleNavigate}
              onSelectIncidentDetail={handleSelectIncident}
            />
          )}

          {currentRoute === 'command-incident-detail' && (
            <IncidentDetailPage
              incidentCode={selectedIncidentCode}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === 'command-reports' && (
            <ReportsPage
              onNavigate={handleNavigate}
              onSelectIncidentDetail={handleSelectIncident}
            />
          )}

          {currentRoute === 'command-resources' && (
            <ResourcesPage onNavigate={handleNavigate} />
          )}

          {currentRoute === 'command-map' && (
            <OperationalMapPage
              onNavigate={handleNavigate}
              onSelectIncidentDetail={handleSelectIncident}
            />
          )}

          {currentRoute === 'command-status' && (
            <SystemStatusPage onNavigate={handleNavigate} />
          )}
        </main>
      </div>

      {/* Public Portal Footer (Only on Citizen views and login) */}
      {!isCommandRoute && <Footer onNavigate={handleNavigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EmergencyDataProvider>
        <AppContent />
      </EmergencyDataProvider>
    </AuthProvider>
  );
}
