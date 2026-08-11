import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getCurrentAcademicYear } from '../utils/academicYear';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  UserCheck,
  ClipboardCheck,
  FileSpreadsheet,
  Award,
  Calendar,
  CheckSquare,
  ShieldAlert,
  Settings,
  ChevronRight,
  User as UserIcon,
  X,
} from 'lucide-react';
import { ProfileModal } from './ProfileModal';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const role = user?.role || 'TEACHER';

  // Navigation Items by Role
  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, roles: ['ADMIN', 'DEPT_HEAD', 'TEACHER', 'COORDINATOR'] },
    { id: 'classes', label: t('classes'), icon: GraduationCap, roles: ['ADMIN', 'DEPT_HEAD', 'COORDINATOR', 'TEACHER'] },
    { id: 'courses', label: t('courses'), icon: BookOpen, roles: ['ADMIN', 'DEPT_HEAD', 'COORDINATOR'] },
    { id: 'teachers', label: t('teachers'), icon: UserCheck, roles: ['ADMIN', 'DEPT_HEAD'] },
    { id: 'students', label: t('students'), icon: Users, roles: ['ADMIN', 'DEPT_HEAD', 'TEACHER', 'COORDINATOR'] },
    { id: 'attendance', label: t('amharic') === 'አማርኛ' ? 'የተማሪዎች መገኘት' : 'Attendance', icon: ClipboardCheck, roles: ['ADMIN', 'DEPT_HEAD', 'TEACHER', 'COORDINATOR'] },
    { id: 'markEntry', label: t('markEntry'), icon: FileSpreadsheet, roles: ['ADMIN', 'DEPT_HEAD', 'TEACHER', 'COORDINATOR'] },
    { id: 'results', label: t('results'), icon: Award, roles: ['ADMIN', 'DEPT_HEAD', 'TEACHER'] },
    { id: 'reviewQueue', label: t('reviewQueue'), icon: CheckSquare, roles: ['ADMIN', 'DEPT_HEAD', 'COORDINATOR'] },
    { id: 'schedules', label: t('schedules'), icon: Calendar, roles: ['ADMIN', 'DEPT_HEAD', 'TEACHER', 'COORDINATOR'] },
    { id: 'auditLogs', label: t('auditLogs'), icon: ShieldAlert, roles: ['ADMIN'] },
    { id: 'users', label: t('users'), icon: Settings, roles: ['ADMIN'] },
  ];

  const visibleNavs = navItems.filter((item) => item.roles.includes(role));

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full text-[#F7E5C8] overflow-hidden">
      <div className="p-4 space-y-1 overflow-y-auto flex-1 min-h-0">
        <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A68F7B]">
          <span>Navigation Menu</span>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-[#CBB39C] hover:text-white p-1 rounded"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {visibleNavs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition duration-150 ${
                isActive
                  ? 'bg-[#27140B] text-[#F5A623] border border-[#F5A623]/40 font-bold shadow-md'
                  : 'hover:bg-[#27140B] text-[#CBB39C] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F5A623]' : 'text-[#CBB39C]'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#F5A623]" />}
            </button>
          );
        })}
      </div>

      {/* Profile Quick Button permanently pinned at bottom of Sidebar */}
      <div className="p-4 border-t border-[#4A2715] space-y-2 bg-[#180B05] shrink-0">
        <button
          onClick={() => {
            setShowProfileModal(true);
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[#27140B] hover:bg-[#351C0F] border border-[#522B17] transition text-xs text-left"
        >
          <div className="w-7 h-7 rounded-full bg-[#351C0F] border border-[#F5A623] flex items-center justify-center text-[#F5A623] font-bold text-[10px] shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="truncate">
            <div className="font-bold text-white truncate text-[11px]">{user?.name}</div>
            <div className="text-[10px] text-[#F5A623]">Edit Profile</div>
          </div>
        </button>

        <div className="text-[10px] text-[#A68F7B] flex flex-col gap-0.5 px-1 pt-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#CBB39C]">
            <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
            <span>Academic Year {getCurrentAcademicYear()}</span>
          </div>
          <div>Haymete Abrham Sunday School</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#180B05] border-r border-[#4A2715] flex-col justify-between shrink-0 h-full overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile & Tablet Slide-Over Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Sidebar */}
          <aside className="relative w-72 max-w-[80vw] bg-[#180B05] border-r border-[#4A2715] flex flex-col justify-between h-full z-10 shadow-2xl overflow-hidden animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
};
