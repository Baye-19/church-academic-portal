import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
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
import { AcademicCalendarView } from './components/AcademicCalendarView';
import { ArrowLeft } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTabState] = useState<string>('dashboard');
  const [tabHistory, setTabHistory] = useState<string[]>(['dashboard']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const setActiveTab = (newTab: string) => {
    if (newTab !== activeTab) {
      setTabHistory((prev) => [...prev, newTab]);
      setActiveTabState(newTab);
    }
  };

  const handleGoBack = () => {
    if (tabHistory.length > 1) {
      const newHistory = [...tabHistory];
      newHistory.pop(); // remove current
      const previousTab = newHistory[newHistory.length - 1];
      setTabHistory(newHistory);
      setActiveTabState(previousTab || 'dashboard');
    } else {
      setActiveTabState('dashboard');
    }
  };

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
      case 'academicCalendar':
        return <AcademicCalendarView />;
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
            {activeTab !== 'dashboard' && (
              <div className="px-3 sm:px-6 pt-3 pb-1 flex items-center justify-between border-b border-[#3A1E10]/40">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#27140B] hover:bg-[#351C0F] text-[#F5A623] hover:text-white border border-[#5C321B] rounded-xl text-xs font-bold transition shadow-md group"
                  title={t('back')}
                >
                  <ArrowLeft className="w-4 h-4 text-[#F5A623] group-hover:-translate-x-1 transition-transform" />
                  <span>{t('back')}</span>
                </button>
              </div>
            )}
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
        <ToastProvider>
          <MainAppContent />
        </ToastProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
