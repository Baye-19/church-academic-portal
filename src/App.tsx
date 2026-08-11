import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { LoginModal } from './components/LoginModal';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DeveloperBanner } from './components/DeveloperBanner';
import { Dashboard } from './components/Dashboard';
import { ClassesView } from './components/ClassesView';
import { CoursesView } from './components/CoursesView';
import { TeachersView } from './components/TeachersView';
import { StudentsView } from './components/StudentsView';
import { MarkEntryView } from './components/MarkEntryView';
import { ResultsView } from './components/ResultsView';
import { SchedulesView } from './components/SchedulesView';
import { ReviewQueueView } from './components/ReviewQueueView';
import { AuditLogView } from './components/AuditLogView';
import { UsersView } from './components/UsersView';
import { AttendanceView } from './components/AttendanceView';

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#180B05] flex items-center justify-center text-[#CBB39C] font-medium text-sm">
        Initializing Sunday School Academic Portal...
      </div>
    );
  }

  if (!user) {
    return <LoginModal />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'classes':
        return <ClassesView />;
      case 'courses':
        return <CoursesView />;
      case 'teachers':
        return <TeachersView />;
      case 'students':
        return <StudentsView />;
      case 'attendance':
        return <AttendanceView />;
      case 'markEntry':
        return <MarkEntryView />;
      case 'results':
        return <ResultsView />;
      case 'schedules':
        return <SchedulesView />;
      case 'reviewQueue':
        return <ReviewQueueView />;
      case 'auditLogs':
        return <AuditLogView />;
      case 'users':
        return <UsersView />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="h-screen max-h-screen bg-[#180B05] text-[#F7E5C8] flex flex-col font-sans overflow-hidden">
      {/* Top Application Header */}
      <Header
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Content View */}
        <main className="flex-1 min-h-0 bg-[#180B05] overflow-y-auto min-w-0 flex flex-col justify-between">
          <div className="flex-1">
            {renderActiveTab()}
          </div>

          {/* Developer Credits Footer (Appears when scrolling to bottom) */}
          <DeveloperBanner />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainAppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
